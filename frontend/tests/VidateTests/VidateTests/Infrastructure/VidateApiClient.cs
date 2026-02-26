using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using VidateTests.TestData;

namespace VidateTests.Infrastructure;

public sealed class VidateApiClient : IDisposable
{
    private readonly HttpClient http;
    private static readonly string ApiBase = TestDataStore.BaseUrl + "/api";

    public VidateApiClient()
    {
        http = new HttpClient();
    }

    public async Task<Credentials> RegisterAndSetupProfileAsync(Random r)
    {
        var email = $"test{r.Next(0, 1_000_000)}@example.com";
        var password = $"Password{r.Next(0, 1000)}!A";

        await RegisterAsync(email, password);
        var token = await LoginAsync(email, password);
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        await SetupProfileAsync();
        await SetupPreferencesAsync();

        return new Credentials(email, password);
    }

    public string Token => http.DefaultRequestHeaders.Authorization?.Parameter ?? "";

    private async Task RegisterAsync(string email, string password)
    {
        var body = JsonSerializer.Serialize(new { email, password });
        var response = await http.PostAsync(
            $"{ApiBase}/auth/register",
            new StringContent(body, Encoding.UTF8, "application/json"));
        response.EnsureSuccessStatusCode();
    }

    private async Task<string> LoginAsync(string email, string password)
    {
        var form = new FormUrlEncodedContent([
            new("grant_type", "password"),
            new("username", email),
            new("password", password),
        ]);
        var response = await http.PostAsync($"{ApiBase}/auth/token", form);
        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        return doc.RootElement.GetProperty("access_token").GetString()!;
    }

    private async Task SetupProfileAsync()
    {
        var body = JsonSerializer.Serialize(new
        {
            first_name = "Test",
            last_name = "User",
            birth_date = "1990-01-15T00:00:00Z",
            gender_id = 1,
            language_ids = new[] { 1 },
            is_smoker = false
        });
        var response = await http.PutAsync(
            $"{ApiBase}/profile/mine",
            new StringContent(body, Encoding.UTF8, "application/json"));
        response.EnsureSuccessStatusCode();
    }

    private async Task SetupPreferencesAsync()
    {
        var body = JsonSerializer.Serialize(new
        {
            gender_ids = new[] { 1, 2 },
            language_ids = new[] { 1 }
        });
        var response = await http.PutAsync(
            $"{ApiBase}/preferences",
            new StringContent(body, Encoding.UTF8, "application/json"));
        response.EnsureSuccessStatusCode();
    }

    public void Dispose() => http.Dispose();
}
