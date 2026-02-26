using NUnit.Framework;
using VidateTests.Infrastructure;
using VidateTests.Pages;

namespace VidateTests.Tests;

[TestFixture, Order(0)]
public class LandingPageTests : BaseTest
{
    [Test]
    public void LandingPage_IsLoaded()
    {
        Navigate("/");
        Assert.That(new LandingPage(driver).IsLoaded());
    }

    [Test]
    public void LandingPage_SignUp_NavigatesToRegister()
    {
        Navigate("/");
        new LandingPage(driver).ClickSignUp();
        Assert.That(driver.Url.Contains("register"));
    }

    [Test]
    public void LandingPage_SignIn_NavigatesToLogin()
    {
        Navigate("/");
        new LandingPage(driver).ClickSignIn();
        Assert.That(driver.Url.Contains("login"));
    }
}
