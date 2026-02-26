using NUnit.Framework;
using VidateTests.Infrastructure;
using VidateTests.Pages;
using VidateTests.TestData;

namespace VidateTests.Tests;

[TestFixture, Order(1)]
public class LoginTests : BaseTest
{
    [Test]
    public void Login_ValidCredentials_RedirectsAwayFromLogin()
    {
        Navigate("/register");
        var credentials = new RegisterPage(driver, r).RegisterNewUser();
        ClearAuthStorage();
        Navigate("/login");
        new LoginPage(driver).Login(credentials.Email, credentials.Password);
        new OpenQA.Selenium.Support.UI.WebDriverWait(driver, TimeSpan.FromSeconds(10))
            .Until(d => !d.Url.Contains("/login"));
        Assert.That(driver.Url, Does.Not.Contain("/login"));
    }

    [Test]
    public void Login_WrongPassword_ShowsError()
    {
        Navigate("/login");
        var page = new LoginPage(driver);
        page.Login(TestDataStore.DefaultEmail, "WrongPassword99");
        Assert.That(page.GetApiError(), Is.Not.Empty);
    }

    [Test]
    public void Login_InvalidEmailFormat_ShowsFieldError()
    {
        Navigate("/login");
        var page = new LoginPage(driver);
        page.Login("notanemail", "Password1");
        Assert.That(page.GetFieldError("email"), Is.Not.Empty);
    }

    [Test]
    public void Login_EmptyEmail_ShowsFieldError()
    {
        Navigate("/login");
        var page = new LoginPage(driver);
        page.Login("", "Password1");
        Assert.That(page.GetFieldError("email"), Is.Not.Empty);
    }

    [Test]
    public void Login_EmptyPassword_ShowsFieldError()
    {
        Navigate("/login");
        var page = new LoginPage(driver);
        page.Login(TestDataStore.DefaultEmail, "");
        Assert.That(page.GetFieldError("password"), Is.Not.Empty);
    }

    [Test]
    public void Login_ForgotPasswordLink_NavigatesToForgotPassword()
    {
        Navigate("/login");
        new LoginPage(driver).ClickForgotPassword();
        Assert.That(driver.Url.Contains("forgot-password"));
    }

    [Test]
    public void Login_RegisterLink_NavigatesToRegister()
    {
        Navigate("/login");
        new LoginPage(driver).ClickRegister();
        Assert.That(driver.Url.Contains("register"));
    }
}

