using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace VidateTests.Pages;

public sealed class LoginPage
{
    private readonly IWebDriver driver;

    public LoginPage(IWebDriver driver) => this.driver = driver;

    public void Login(string email, string password)
    {
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        wait.Until(d => d.FindElement(By.Id("email")));
        driver.FindElement(By.Id("email")).SendKeys(email);
        driver.FindElement(By.Id("password")).SendKeys(password);
        driver.FindElement(By.CssSelector("[type='submit']")).Click();
    }

    public string GetApiError()
    {
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
        return wait.Until(d => d.FindElement(By.CssSelector("[role='alert']"))).Text;
    }

    public string GetFieldError(string fieldId)
    {
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
        return wait.Until(d => d.FindElement(By.XPath($"//input[@id='{fieldId}']/following::span[contains(@class,'text-textError')][1]"))).Text;
    }

    public void ClickForgotPassword()
    {
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        var element = wait.Until(d => d.FindElement(By.XPath("//a[@href='/forgot-password']")));
        ((IJavaScriptExecutor)driver).ExecuteScript("arguments[0].scrollIntoView(true);", element);
        element.Click();
    }

    public void ClickRegister()
    {
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        wait.Until(d => d.FindElement(By.LinkText("Sign up"))).Click();
    }
}
