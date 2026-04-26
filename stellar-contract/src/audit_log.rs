use soroban_sdk::{contracttype, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone)]
pub struct AuditLog {
    pub id: u64,
    pub action: String,
    pub actor: Address,
    pub target: String,
    pub timestamp: u64,
    pub details: String,
}

#[contracttype]
pub struct AuditLogFilter {
    pub action: Option<String>,
    pub actor: Option<Address>,
    pub start_time: Option<u64>,
    pub end_time: Option<u64>,
}

pub struct AuditLogService;

impl AuditLogService {
    pub fn log_action(
        env: &Env,
        action: String,
        actor: Address,
        target: String,
        details: String,
    ) {
        let timestamp = env.ledger().timestamp();
        let log_id_key = soroban_sdk::symbol_short!("audit_id");
        let current_id: u64 = env
            .storage()
            .persistent()
            .get(&log_id_key)
            .unwrap_or(Ok(0u64))
            .unwrap_or(0);

        let new_id = current_id + 1;
        env.storage()
            .persistent()
            .set(&log_id_key, &new_id);

        let log = AuditLog {
            id: new_id,
            action: action.clone(),
            actor: actor.clone(),
            target: target.clone(),
            timestamp,
            details,
        };

        let log_key = soroban_sdk::symbol_short!("log");
        let mut logs: Vec<AuditLog> = env
            .storage()
            .persistent()
            .get(&log_key)
            .unwrap_or(Ok(Vec::new(env)))
            .unwrap_or_else(|_| Vec::new(env));

        logs.push_back(log);

        // Keep only last 10000 logs (retention policy)
        if logs.len() > 10000 {
            let start = logs.len() - 10000;
            let mut new_logs = Vec::new(env);
            for i in start..logs.len() {
                if let Ok(log) = logs.get(i as u32) {
                    new_logs.push_back(log);
                }
            }
            env.storage().persistent().set(&log_key, &new_logs);
        } else {
            env.storage().persistent().set(&log_key, &logs);
        }
    }

    pub fn get_logs(env: &Env) -> Vec<AuditLog> {
        let log_key = soroban_sdk::symbol_short!("log");
        env.storage()
            .persistent()
            .get(&log_key)
            .unwrap_or(Ok(Vec::new(env)))
            .unwrap_or_else(|_| Vec::new(env))
    }

    pub fn search_logs(env: &Env, filter: AuditLogFilter) -> Vec<AuditLog> {
        let logs = Self::get_logs(env);
        let mut results = Vec::new(env);

        for i in 0..logs.len() {
            if let Ok(log) = logs.get(i) {
                let mut matches = true;

                if let Some(ref action) = filter.action {
                    if log.action != *action {
                        matches = false;
                    }
                }

                if let Some(ref actor) = filter.actor {
                    if log.actor != *actor {
                        matches = false;
                    }
                }

                if let Some(start) = filter.start_time {
                    if log.timestamp < start {
                        matches = false;
                    }
                }

                if let Some(end) = filter.end_time {
                    if log.timestamp > end {
                        matches = false;
                    }
                }

                if matches {
                    results.push_back(log);
                }
            }
        }

        results
    }

    pub fn export_logs(env: &Env) -> Vec<AuditLog> {
        Self::get_logs(env)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_audit_log_creation() {
        // Basic structure test
        let log = AuditLog {
            id: 1,
            action: String::from_slice(&soroban_sdk::Env::default(), "test"),
            actor: Address::generate(&soroban_sdk::Env::default()),
            target: String::from_slice(&soroban_sdk::Env::default(), "target"),
            timestamp: 1000,
            details: String::from_slice(&soroban_sdk::Env::default(), "details"),
        };
        assert_eq!(log.id, 1);
    }

    #[test]
    fn test_audit_log_filter() {
        let filter = AuditLogFilter {
            action: None,
            actor: None,
            start_time: None,
            end_time: None,
        };
        assert!(filter.action.is_none());
    }
}
