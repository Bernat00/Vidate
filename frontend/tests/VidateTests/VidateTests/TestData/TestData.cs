namespace VidateTests.TestData;

public static class TestDataStore
{
    public const string BaseUrl = "http://localhost:8080";
    public const string DefaultEmail = "admin@example.com";
    public const string DefaultPassword = "Admin2006";

    public static Credentials? CurrentCredentials { get; set; }
}

public record Credentials(string Email, string Password);
