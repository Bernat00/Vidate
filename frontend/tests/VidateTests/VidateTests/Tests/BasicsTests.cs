using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using VidateTests.Infrastructure;
using VidateTests.Pages;

namespace VidateTests.Tests;

[TestFixture, Order(0)]
public class BasicsTests : BaseTest
{
    [Test]
    public void ServerRunning()
    {
        Navigate("");
        Assert.That(driver.FindElement(By.Id("root")).Displayed);
    }

    [Test]
    public void Register_ValidData_RedirectsToSetupProfile()
    {
        Navigate("/register");
        new RegisterPage(driver, r).RegisterNewUser();
        Assert.That(driver.Url.Contains("setup-profile"));
    }

    [Test]
    public void Register_PasswordMismatch_ShowsError()
    {
        Navigate("/register");
        var page = new RegisterPage(driver, r);
        page.FillForm("unique@example.com", "Password1", "Password2");
        Assert.That(page.GetFieldError("confirm-password"), Does.Contain("do not match"));
    }

    [Test]
    public void Register_WeakPassword_ShowsError()
    {
        Navigate("/register");
        var page = new RegisterPage(driver, r);
        page.FillForm("unique@example.com", "weak", "weak");
        Assert.That(page.GetFieldError("password"), Is.Not.Empty);
    }

    [Test]
    public void Register_InvalidEmailFormat_ShowsError()
    {
        Navigate("/register");
        var page = new RegisterPage(driver, r);
        page.FillForm("notanemail", "Password1", "Password1");
        Assert.That(page.GetFieldError("email"), Is.Not.Empty);
    }
}

