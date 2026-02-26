using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using VidateTests.Models;
using OpenQA.Selenium.Support.Extensions;

namespace VidateTests.Pages;

public sealed class ProfileSetupPage
{
    private readonly IWebDriver driver;
    private readonly Random r;

    public ProfileSetupPage(IWebDriver driver, Random random)
    {
        this.driver = driver;
        r = random;
    }

    public ProfileSetupCase GenerateRandomProfileCase()
    {
        new WebDriverWait(driver, TimeSpan.FromSeconds(10))
            .Until(d => d.FindElement(By.Id("gender_id")));

        var genderOptions = GetSelectOptions("gender_id");
        var religionOptions = GetSelectOptions("religion_id");
        var smokerOptions = GetSelectOptions("self_is_smoker");
        var wantsChildrenOptions = GetSelectOptions("self_wants_children");
        var prefWantsChildrenOptions = GetSelectOptions("pref_wants_children");
        var prefSmokerOptions = GetSelectOptions("pref_is_smoker");

        var languages = PickRandomSubset(GetButtonLabelsByFor("language_ids"), 1, 3);
        var preferredGenders = PickRandomSubset(GetButtonLabelsByFor("preferred_gender_ids"), 1, 2);
        var preferredReligions = PickRandomSubset(GetButtonLabelsByFor("preferred_religion_ids"), 0, 2);

        int? prefAgeMin = null;
        int? prefAgeMax = null;
        if (r.Next(2) == 0)
        {
            prefAgeMin = r.Next(18, 99);
            prefAgeMax = r.Next(prefAgeMin.Value + 1, 110);
        }

        return new ProfileSetupCase(
            RandomString(6),
            r.Next(0, 2) == 0 ? null : RandomString(4),
            RandomString(7),
            RandomBirthDate(),
            PickRandom(genderOptions),
            PickRandomOrNull(religionOptions),
            PickRandom(smokerOptions),
            prefAgeMin,
            prefAgeMax,
            PickRandomOrNull(wantsChildrenOptions),
            PickRandomOrNull(prefWantsChildrenOptions),
            PickRandomOrNull(prefSmokerOptions),
            languages,
            preferredGenders,
            preferredReligions);
    }

    public void FillProfile(ProfileSetupCase profile)
    {
        driver.FindElement(By.Id("first_name")).SendKeys(profile.FirstName);
        if (!string.IsNullOrWhiteSpace(profile.MiddleName))
        {
            driver.FindElement(By.Id("middle_name")).SendKeys(profile.MiddleName);
        }
        driver.FindElement(By.Id("last_name")).SendKeys(profile.LastName);
        SetDateField("birth_date", profile.BirthDate);

        new SelectElement(driver.FindElement(By.Id("gender_id"))).SelectByText(profile.Gender);
        if (!string.IsNullOrWhiteSpace(profile.Religion))
        {
            new SelectElement(driver.FindElement(By.Id("religion_id"))).SelectByText(profile.Religion);
        }

        ClickButtonsByText(profile.Languages);

        if (!string.IsNullOrWhiteSpace(profile.SelfIsSmoker))
        {
            new SelectElement(driver.FindElement(By.Id("self_is_smoker"))).SelectByText(profile.SelfIsSmoker);
        }

        if (profile.PrefAgeMin.HasValue)
        {
            driver.FindElement(By.Id("pref_age_min")).SendKeys(profile.PrefAgeMin.Value.ToString());
        }
        if (profile.PrefAgeMax.HasValue)
        {
            driver.FindElement(By.Id("pref_age_max")).SendKeys(profile.PrefAgeMax.Value.ToString());
        }

        if (!string.IsNullOrWhiteSpace(profile.SelfWantsChildren))
        {
            new SelectElement(driver.FindElement(By.Id("self_wants_children"))).SelectByText(profile.SelfWantsChildren);
        }
        if (!string.IsNullOrWhiteSpace(profile.PrefWantsChildren))
        {
            new SelectElement(driver.FindElement(By.Id("pref_wants_children"))).SelectByText(profile.PrefWantsChildren);
        }
        if (!string.IsNullOrWhiteSpace(profile.PrefIsSmoker))
        {
            new SelectElement(driver.FindElement(By.Id("pref_is_smoker"))).SelectByText(profile.PrefIsSmoker);
        }

        ClickButtonsByText(profile.PreferredGenders);
        ClickButtonsByText(profile.PreferredReligions);
    }

    public void Submit()
    {
        driver.FindElement(By.CssSelector("[type='submit']")).Click();
    }

    public void SubmitAndWait()
    {
        Submit();
        try
        {
            new WebDriverWait(driver, TimeSpan.FromSeconds(15))
                .Until(d => !d.Url.Contains("setup-profile"));
        }
        catch (OpenQA.Selenium.WebDriverTimeoutException)
        {
            var errors = driver
                .FindElements(By.XPath("//span[contains(@class,'text-textError')]"))
                .Where(e => e.Displayed)
                .Select(e => e.Text)
                .Where(t => !string.IsNullOrEmpty(t))
                .ToList();
            var birthDateValue = driver.FindElement(By.Id("birth_date")).GetAttribute("value");
            throw new Exception(
                $"Profile form did not submit. birth_date value='{birthDateValue}'. " +
                $"Validation errors: [{string.Join(" | ", errors)}]. URL: {driver.Url}");
        }
    }

    private void SetDateField(string fieldId, string isoDate)
    {
        var date = DateTime.ParseExact(isoDate, "yyyy-MM-dd", null);
        var input = driver.FindElement(By.Id(fieldId));
        input.Click();
        input.SendKeys(date.ToString("MMddyyyy"));
    }

    private void ClickButtonsByText(IEnumerable<string>? labels)
    {
        if (labels == null)
        {
            return;
        }

        foreach (var label in labels)
        {
            driver.FindElement(By.XPath($"//button[normalize-space()='{label}']")).Click();
        }
    }

    private IReadOnlyList<string> GetSelectOptions(string selectId)
    {
        var select = new SelectElement(driver.FindElement(By.Id(selectId)));
        return select.Options
            .Where(option => option.Enabled == true)
            .Where(option => !string.IsNullOrWhiteSpace(option.GetAttribute("value")))
            .Select(option => option.Text.Trim())
            .ToList();
    }

    private IReadOnlyList<string> GetButtonLabelsByFor(string forAttribute)
    {
        return driver.FindElements(By.XPath($"//label[@for='{forAttribute}']/following::div[contains(@class,'flex')][1]//button"))
            .Select(button => button.Text.Trim())
            .Where(text => !string.IsNullOrWhiteSpace(text))
            .ToList();
    }

    private string[]? PickRandomSubset(IReadOnlyList<string> options, int min, int max)
    {
        if (options.Count == 0)
        {
            return null;
        }

        var count = r.Next(min, Math.Min(max, options.Count) + 1);
        if (count == 0)
        {
            return null;
        }

        return options.OrderBy(_ => r.Next()).Take(count).ToArray();
    }

    private string PickRandom(IReadOnlyList<string> options)
    {
        if (options.Count == 0)
        {
            throw new InvalidOperationException("No options available for selection.");
        }

        return options[r.Next(options.Count)];
    }

    private string? PickRandomOrNull(IReadOnlyList<string> options)
    {
        if (options.Count == 0 || r.Next(0, 3) == 0)
        {
            return null;
        }

        return PickRandom(options);
    }

    private string RandomString(int length)
    {
        const string chars = "abcdefghijklmnopqrstuvwxyz";
        return new string(Enumerable.Range(0, length).Select(_ => chars[r.Next(chars.Length)]).ToArray());
    }

    private string RandomBirthDate()
    {
        var year = r.Next(1980, 2005);
        var month = r.Next(1, 13);
        var day = r.Next(1, DateTime.DaysInMonth(year, month) + 1);
        return new DateTime(year, month, day).ToString("yyyy-MM-dd");
    }
}
