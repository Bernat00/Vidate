using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace VidateTests.Pages;

public sealed class AccountSettingsPage
{
    private readonly IWebDriver driver;

    public AccountSettingsPage(IWebDriver driver) => this.driver = driver;

    public bool IsLoaded()
    {
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
        return wait.Until(d => d.FindElement(By.Id("email"))).Displayed;
    }

    public void UpdateEmail(string email)
    {
        var emailField = driver.FindElement(By.Id("email"));
        emailField.Clear();
        emailField.SendKeys(email);
    }

    public void FillPasswordChange(string oldPassword, string newPassword, string confirmNewPassword)
    {
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        wait.Until(d => d.FindElement(By.XPath("//input[@id='old-password']")));
        driver.FindElement(By.XPath("//input[@id='old-password']")).SendKeys(oldPassword);
        driver.FindElement(By.XPath("//input[@id='new-password']")).SendKeys(newPassword);
        driver.FindElement(By.XPath("//input[@id='confirm-new-password']")).SendKeys(confirmNewPassword);
    }

    public void Submit()
    {
        var submitWait = new WebDriverWait(driver, TimeSpan.FromSeconds(15));
        submitWait.Until(_ =>
            {
                try
                {
                    driver.FindElement(By.CssSelector("[type='submit']")).Click();
                }
                catch (ElementClickInterceptedException)
                {
                    return false;
                }

                return true;
            
            }
        );

    }

    public string GetApiError()
    {
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
        return wait.Until(d => d.FindElement(By.CssSelector("[role='alert']"))).Text;
    }

    public string GetFieldError(string fieldId)
    {
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
        return wait.Until(d => d.FindElement(By.XPath(
            $"//input[@id='{fieldId}']/following::span[contains(@class,'text-textError')][1]"))).Text;
    }

    public void Logout()
    {
        Thread.Sleep(1000);
        driver.FindElement(By.XPath("//button[contains(.,'Log out')]")).Click();

    }
}
