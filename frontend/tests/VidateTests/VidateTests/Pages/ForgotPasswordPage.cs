using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace VidateTests.Pages;

public sealed class ForgotPasswordPage
{
    private readonly IWebDriver driver;

    public ForgotPasswordPage(IWebDriver driver) => this.driver = driver;

    public void RequestReset(string email)
    {
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        wait.Until(d => d.FindElement(By.Id("email")));
        driver.FindElement(By.Id("email")).SendKeys(email);
        driver.FindElement(By.CssSelector("[type='submit']")).Click();
    }

    public bool IsSuccessState()
    {
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
        return wait.Until(d => d.FindElement(By.LinkText("Back to login"))).Displayed;
    }

    public string GetFieldError(string fieldId)
    {
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
        return wait.Until(d => d.FindElement(By.XPath($"//input[@id='{fieldId}']/following::span[contains(@class,'text-textError')][1]"))).Text;
    }
}
