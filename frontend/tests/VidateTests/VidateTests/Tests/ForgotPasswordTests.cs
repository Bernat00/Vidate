using NUnit.Framework;
using VidateTests.Infrastructure;
using VidateTests.Pages;

namespace VidateTests.Tests;

[TestFixture]
public class ForgotPasswordTests : BaseTest
{
    [Test]
    public void ForgotPassword_ValidEmail_ShowsSuccessMessage()
    {
        Navigate("/forgot-password");
        var page = new ForgotPasswordPage(driver);
        page.RequestReset("teszt@teszt.com");
        Assert.That(page.IsSuccessState());
    }

    [Test]
    public void ForgotPassword_InvalidEmailFormat_ShowsFieldError()
    {
        Navigate("/forgot-password");
        var page = new ForgotPasswordPage(driver);
        page.RequestReset("notanemail");
        Assert.That(page.GetFieldError("email"), Is.Not.Empty);
    }

    [Test]
    public void ForgotPassword_EmptyEmail_ShowsFieldError()
    {
        Navigate("/forgot-password");
        var page = new ForgotPasswordPage(driver);
        page.RequestReset("");
        Assert.That(page.GetFieldError("email"), Is.Not.Empty);
    }
}
