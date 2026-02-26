using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using VidateTests.Pages;
using VidateTests.TestData;

namespace VidateTests.Infrastructure;

public abstract class BaseTest
{
    protected IWebDriver driver;
    protected readonly Random r = new();

    protected void Navigate(string subEndpoint)
    {
        driver.Navigate().GoToUrl(TestDataStore.BaseUrl + subEndpoint);
    }

    protected void ClearAuthStorage()
    {
        ((IJavaScriptExecutor)driver).ExecuteScript("localStorage.clear(); sessionStorage.clear();");
    }

    protected TestData.Credentials RegisterAndSetupProfile()
    {
        using var api = new VidateApiClient();
        var credentials = api.RegisterAndSetupProfileAsync(r).GetAwaiter().GetResult();

        Navigate("/");
        ((IJavaScriptExecutor)driver).ExecuteScript(
            $"sessionStorage.setItem('token', '{api.Token}');");
        Navigate("/my-matches");

        return credentials;
    }

    [SetUp]
    public void Setup()
    {
        var options = new ChromeOptions();
        options.AddArgument("--headless=new");
        options.AddArgument("--window-size=1920,1080");
        driver = new ChromeDriver(options);
    }

    [TearDown]
    public void TearDown()
    {
        driver.Dispose();
    }
}
