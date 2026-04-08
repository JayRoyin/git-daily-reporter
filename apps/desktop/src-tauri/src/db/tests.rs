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
                "Personal GitHub",
                "qstdc",
                "qstdc@example.com",
                "ssh",
            )
            .expect("save should succeed");

        let count: i64 = database
            .connection
            .query_row("SELECT COUNT(*) FROM accounts", [], |row| row.get(0))
            .expect("count query should succeed");

        assert_eq!(count, 1);
    }
}
