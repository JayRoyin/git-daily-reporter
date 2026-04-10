#[cfg(test)]
mod tests {
    use super::super::initialize_database;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn initializes_database_and_creates_tables() {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("time went backwards")
            .as_nanos();
        let db_path = std::env::temp_dir().join(format!("gdr-test-{suffix}.sqlite"));

        let database = initialize_database(&db_path).expect("db init should succeed");
        let count: i64 = database
            .connection
            .query_row(
                "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'accounts'",
                [],
                |row| row.get(0),
            )
            .expect("table query should succeed");

        assert_eq!(count, 1);
    }

    #[test]
    fn saves_account_record() {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("time went backwards")
            .as_nanos();
        let db_path = std::env::temp_dir().join(format!("gdr-account-{suffix}.sqlite"));

        let mut database = initialize_database(&db_path).expect("db init should succeed");
        database
            .save_account(
                "acc-1",
                "github",
                None,
                "Personal GitHub",
                "qstdc",
                "qstdc@example.com",
                "ssh",
                "unverified",
                None,
                None,
            )
            .expect("save should succeed");

        let count: i64 = database
            .connection
            .query_row("SELECT COUNT(*) FROM accounts", [], |row| row.get(0))
            .expect("count query should succeed");

        assert_eq!(count, 1);
    }

    #[test]
    fn saves_account_with_platform_and_verification_metadata() {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("time went backwards")
            .as_nanos();
        let db_path = std::env::temp_dir().join(format!("gdr-account-platform-{suffix}.sqlite"));

        let mut database = initialize_database(&db_path).expect("db init should succeed");
        database
            .save_account(
                "acc-2",
                "gitlab",
                Some("https://gitlab.com"),
                "Work GitLab",
                "qstdc-work",
                "work@example.com",
                "https_token",
                "unverified",
                None,
                None,
            )
            .expect("save should succeed");

        let row: (String, String) = database
            .connection
            .query_row(
                "SELECT platform, COALESCE(verification_status, 'unverified') FROM accounts WHERE id = 'acc-2'",
                [],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .expect("query should succeed");

        assert_eq!(row.0, "gitlab");
        assert_eq!(row.1, "unverified");
    }

    #[test]
    fn saves_credential_and_provider_mask_metadata() {
        let suffix = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("time went backwards")
            .as_nanos();
        let db_path = std::env::temp_dir().join(format!("gdr-secret-mask-{suffix}.sqlite"));

        let mut database = initialize_database(&db_path).expect("db init should succeed");
        database
            .save_account(
                "acc-3",
                "github",
                None,
                "Personal GitHub",
                "qstdc",
                "qstdc@example.com",
                "ssh",
                "unverified",
                None,
                None,
            )
            .expect("save account should succeed");
        database
            .save_credential(
                "cred-1",
                "acc-3",
                "https_token",
                "GitHub PAT",
                "app://secret/cred-1",
                "****red-1",
                None,
                "qstdc",
                "saved",
            )
            .expect("save credential should succeed");
        database
            .save_llm_provider(
                "llm-1",
                "Kimi",
                "https://api.moonshot.cn/v1/chat/completions",
                "moonshot-v1-8k",
                "app://secret/llm-1",
                "****llm-1",
                "unverified",
                None,
            )
            .expect("save provider should succeed");

        let credential_secret_ref: String = database
            .connection
            .query_row(
                "SELECT secret_ref FROM credentials WHERE id = 'cred-1'",
                [],
                |row| row.get(0),
            )
            .expect("credential query should succeed");

        let provider_secret_ref: String = database
            .connection
            .query_row(
                "SELECT api_key_ref FROM llm_providers WHERE id = 'llm-1'",
                [],
                |row| row.get(0),
            )
            .expect("provider query should succeed");

        assert_eq!(credential_secret_ref, "app://secret/cred-1");
        assert_eq!(provider_secret_ref, "app://secret/llm-1");
    }
}
