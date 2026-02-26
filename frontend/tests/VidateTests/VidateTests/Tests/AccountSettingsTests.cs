using NUnit.Framework;
using VidateTests.Infrastructure;
using VidateTests.Pages;

namespace VidateTests.Tests;

[TestFixture]
public class AccountSettingsTests : BaseTest
{
    private void SignInWithSetupAccount()
    {
        RegisterAndSetupProfile();
        Navigate("/profile");
    }

    [Test]
    public void AccountSettings_PageLoads_WhenLoggedIn()
    {
        SignInWithSetupAccount();
        Assert.That(new AccountSettingsPage(driver).IsLoaded());
    }

    [Test]
    public void AccountSettings_Logout_RedirectsToLogin()
    {
        SignInWithSetupAccount();
        new AccountSettingsPage(driver).Logout();
        Assert.That(driver.Url, Does.Contain("login"));
    }

    [Test]
    public void AccountSettings_ChangePassword_MismatchedPasswords_ShowsError()
    {
        RegisterAndSetupProfile();
        Navigate("/profile");
        var page = new AccountSettingsPage(driver);
        page.FillPasswordChange("WrongOldPassword1!", "NewPass1!", "NewPass2!");
        page.Submit();
        Assert.That(page.GetFieldError("confirm-new-password"), Is.Not.Empty);
    }
}

