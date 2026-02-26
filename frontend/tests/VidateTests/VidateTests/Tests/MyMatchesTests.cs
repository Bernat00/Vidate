using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using VidateTests.Infrastructure;
using VidateTests.Pages;
using VidateTests.TestData;

namespace VidateTests.Tests;

[TestFixture]
public class MyMatchesTests : BaseTest
{
    private void SignIn()
    {
        Navigate("/login");
        new LoginPage(driver).Login(TestDataStore.DefaultEmail, TestDataStore.DefaultPassword);
    }

    [Test]
    public void MyMatches_PageLoads_WhenLoggedIn()
    {
        SignIn();
        Navigate("/my-matches");
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
        Assert.That(wait.Until(d => d.FindElement(By.Id("root"))).Displayed);
    }

    [Test]
    public void MyMatches_RedirectsToLogin_WhenNotAuthenticated()
    {
        Navigate("/my-matches");
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
        wait.Until(d => d.Url.Contains("login") || d.Url.Contains("/"));
        Assert.That(driver.Url, Does.Not.Contain("my-matches"));
    }
}
