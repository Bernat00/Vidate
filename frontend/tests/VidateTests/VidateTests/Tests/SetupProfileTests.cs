using NUnit.Framework;
using VidateTests.Infrastructure;
using VidateTests.Pages;

namespace VidateTests.Tests;

[TestFixture]
public class SetupProfileTests : BaseTest
{
    [Repeat(10)]
    [Test]
    public void SetupProfile_RandomCase()
    {
        Navigate("/register");
        new RegisterPage(driver, r).RegisterNewUser();
        var page = new ProfileSetupPage(driver, r);
        var profile = page.GenerateRandomProfileCase();
        page.FillProfile(profile);
        page.SubmitAndWait();
        Assert.That(driver.Url, Does.Not.Contain("setup-profile"));
    }

}
