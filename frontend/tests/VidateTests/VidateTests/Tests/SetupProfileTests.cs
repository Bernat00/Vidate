using NUnit.Framework;
using VidateTests.Infrastructure;
using VidateTests.Models;
using VidateTests.Pages;

namespace VidateTests.Tests;

[TestFixture]
public class SetupProfileTests : BaseTest
{
    [TestCaseSource(nameof(ProfileCases))]
    public void SetupProfile_ProfileCase(ProfileSetupCase profile)
    {
        Navigate("/register");
        new RegisterPage(driver, r).RegisterNewUser();
        var page = new ProfileSetupPage(driver);
        var resolvedProfile = page.ResolveProfile(profile);
        page.FillProfile(resolvedProfile);
        page.SubmitAndWait();
        Assert.That(driver.Url, Does.Not.Contain("setup-profile"));
    }

    private static IEnumerable<TestCaseData> ProfileCases()
    {
        yield return new TestCaseData(new ProfileSetupCase(
            "Alex",
            null,
            "Smith",
            "1992-04-15",
            "Male",
            "Christianity",
            "No",
            25,
            32,
            "Yes",
            "No",
            "No",
            new[] { "English" },
            new[] { "Female" },
            new[] { "Christianity" }))
            .SetName("SetupProfile_Male_Christianity");

        yield return new TestCaseData(new ProfileSetupCase(
            "Eva",
            "Marie",
            "Kiss",
            "1998-11-26",
            "Female",
            "Judaism",
            "No",
            23,
            35,
            "No",
            "Yes",
            "No",
            new[] { "English", "Hungarian" },
            new[] { "Male" },
            new[] { "Judaism" }))
            .SetName("SetupProfile_Female_Judaism");

        yield return new TestCaseData(new ProfileSetupCase(
            "Sam",
            null,
            "Lee",
            "1990-01-15",
            "Other",
            null,
            "Yes",
            null,
            null,
            "No",
            null,
            "Yes",
            new[] { "English" },
            new[] { "Male", "Female" },
            new[] { "Atheism" }))
            .SetName("SetupProfile_Other_NoAgePrefs");
    }

}
