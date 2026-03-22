using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;

namespace HRMPayroll.DAL
{
    /// <summary>
    /// Helper kết nối SQL Server (LocalDB) và thực thi query dùng chung.
    /// Tất cả DAO đều gọi qua lớp này.
    /// </summary>
    public static class DatabaseHelper
    {
        // Connection string – đọc từ App.config hoặc dùng mặc định
        private static readonly string _connectionString;

        static DatabaseHelper()
        {
            // Ưu tiên đọc từ App.config
            var configCs = System.Configuration.ConfigurationManager
                              .ConnectionStrings["HRMPayroll"]?.ConnectionString;
            _connectionString = configCs
                ?? @"Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=HRMPayroll;Integrated Security=True;";
        }

        /// <summary>Lấy connection string hiện tại.</summary>
        public static string ConnectionString => _connectionString;

        /// <summary>Tạo và trả về một SqlConnection mới (chưa mở).</summary>
        public static SqlConnection GetConnection()
            => new SqlConnection(_connectionString);

        // ── SELECT trả về DataTable ──────────────────────────────────

        /// <summary>
        /// Thực thi câu SELECT, trả về DataTable.
        /// </summary>
        public static DataTable ExecuteQuery(string sql, params SqlParameter[] parameters)
        {
            using var conn = GetConnection();
            using var cmd  = new SqlCommand(sql, conn);
            if (parameters != null)
                cmd.Parameters.AddRange(parameters);
            using var adapter = new SqlDataAdapter(cmd);
            var table = new DataTable();
            adapter.Fill(table);
            return table;
        }

        // ── INSERT / UPDATE / DELETE ─────────────────────────────────

        /// <summary>
        /// Thực thi INSERT, UPDATE, DELETE. Trả về số dòng bị ảnh hưởng.
        /// </summary>
        public static int ExecuteNonQuery(string sql, params SqlParameter[] parameters)
        {
            using var conn = GetConnection();
            using var cmd  = new SqlCommand(sql, conn);
            if (parameters != null)
                cmd.Parameters.AddRange(parameters);
            conn.Open();
            return cmd.ExecuteNonQuery();
        }

        // ── Scalar ───────────────────────────────────────────────────

        /// <summary>
        /// Thực thi query trả về giá trị đơn (COUNT, MAX, SCOPE_IDENTITY...).
        /// </summary>
        public static object? ExecuteScalar(string sql, params SqlParameter[] parameters)
        {
            using var conn = GetConnection();
            using var cmd  = new SqlCommand(sql, conn);
            if (parameters != null)
                cmd.Parameters.AddRange(parameters);
            conn.Open();
            return cmd.ExecuteScalar();
        }

        // ── Helper tạo parameter ─────────────────────────────────────

        /// <summary>Tạo SqlParameter, tự xử lý null → DBNull.</summary>
        public static SqlParameter Param(string name, object? value)
            => new SqlParameter(name, value ?? DBNull.Value);

        /// <summary>Kiểm tra kết nối DB có thành công không.</summary>
        public static bool TestConnection()
        {
            try
            {
                using var conn = GetConnection();
                conn.Open();
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
