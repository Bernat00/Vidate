using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using VidateTests.Models;

namespace VidateTests.Pages;

public sealed class ProfileSetupPage
{
    private readonly IWebDriver driver;

    public ProfileSetupPage(IWebDriver driver)
    {
        this.driver = driver;
    }


    public ProfileSetupCase ResolveProfile(ProfileSetupCase profile)
    {
        var genderOptions = GetSelectOptions("gender_id");
        var religionOptions = GetSelectOptions("religion_id");
        var smokerOptions = GetSelectOptions("self_is_smoker");
        var wantsChildrenOptions = GetSelectOptions("self_wants_children");
        var prefWantsChildrenOptions = GetSelectOptions("pref_wants_children");
        var prefSmokerOptions = GetSelectOptions("pref_is_smoker");

        var languageOptions = GetButtonLabelsByFor("language_ids");
        var preferredGenderOptions = GetButtonLabelsByFor("preferred_gender_ids");
        var preferredReligionOptions = GetButtonLabelsByFor("preferred_religion_ids");

        var resolvedGender = EnsureOption(profile.Gender, genderOptions, required: true)!;
        var resolvedReligion = EnsureOption(profile.Religion, religionOptions, required: false);
        var resolvedSmoker = EnsureOption(profile.SelfIsSmoker, smokerOptions, required: true)!;
        var resolvedWantsChildren = EnsureOption(profile.SelfWantsChildren, wantsChildrenOptions, required: false);
        var resolvedPrefWantsChildren = EnsureOption(profile.PrefWantsChildren, prefWantsChildrenOptions, required: false);
        var resolvedPrefIsSmoker = EnsureOption(profile.PrefIsSmoker, prefSmokerOptions, required: false);

        var resolvedLanguages = EnsureMulti(profile.Languages, languageOptions, required: true);
        var resolvedPreferredGenders = EnsureMulti(profile.PreferredGenders, preferredGenderOptions, required: true);
        var resolvedPreferredReligions = EnsureMulti(profile.PreferredReligions, preferredReligionOptions, required: false);

        return profile with
        {
            Gender = resolvedGender,
            Religion = resolvedReligion,
            SelfIsSmoker = resolvedSmoker,
            SelfWantsChildren = resolvedWantsChildren,
            PrefWantsChildren = resolvedPrefWantsChildren,
            PrefIsSmoker = resolvedPrefIsSmoker,
            Languages = resolvedLanguages,
            PreferredGenders = resolvedPreferredGenders,
            PreferredReligions = resolvedPreferredReligions
        };
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

    private static string? EnsureOption(string? desired, IReadOnlyList<string> options, bool required)
    {
        if (!string.IsNullOrWhiteSpace(desired))
        {
            var match = options.FirstOrDefault(option => option.Equals(desired, StringComparison.OrdinalIgnoreCase));
            if (!string.IsNullOrWhiteSpace(match))
            {
                return match;
            }
        }

        return required && options.Count > 0 ? options[0] : null;
    }

    private static string[]? EnsureMulti(IEnumerable<string>? desired, IReadOnlyList<string> options, bool required)
    {
        var desiredSet = desired?.ToHashSet(StringComparer.OrdinalIgnoreCase) ?? new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var resolved = options.Where(option => desiredSet.Contains(option)).ToList();

        if (resolved.Count == 0 && required && options.Count > 0)
        {
            resolved.Add(options[0]);
        }

        return resolved.Count > 0 ? resolved.ToArray() : null;
    }

    
}
