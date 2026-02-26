using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace VidateTests.Pages;

public sealed class LandingPage
{
    private readonly IWebDriver driver;

    public LandingPage(IWebDriver driver) => this.driver = driver;

    public bool IsLoaded()
    {
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
        return wait.Until(d => d.FindElement(By.LinkText("Sign Up"))).Displayed;
    }

    public void ClickSignUp() => driver.FindElement(By.LinkText("Sign Up")).Click();

    public void ClickSignIn() => driver.FindElement(By.LinkText("Sign In")).Click();
}
