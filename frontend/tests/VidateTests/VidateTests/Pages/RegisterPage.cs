using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using VidateTests.TestData;

namespace VidateTests.Pages;

public sealed class RegisterPage
{
    private readonly IWebDriver driver;
    private readonly Random r;

    public RegisterPage(IWebDriver driver, Random random)
    {
        this.driver = driver;
        r = random;
    }

    public void FillForm(string email, string password, string confirmPassword)
    {
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        wait.Until(d => d.FindElement(By.Id("email")));
        driver.FindElement(By.Id("email")).SendKeys(email);
        driver.FindElement(By.Id("password")).SendKeys(password);
        driver.FindElement(By.Id("confirm-password")).SendKeys(confirmPassword);
        driver.FindElement(By.XPath("/html/body/div[1]/div/div/form")).Submit();
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

    public Credentials RegisterNewUser()
    {
        var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(15));
        wait.Until(d => d.FindElement(By.Id("email")));

        var emailOk = false;
        while (!emailOk)
        {
            var email = $"test{r.Next(0, 100000)}@example.com";
            var password = $"Password{r.Next(0, 100)}!";

            driver.FindElement(By.Id("email")).Clear();
            driver.FindElement(By.Id("email")).SendKeys(email);
            driver.FindElement(By.Id("password")).Clear();
            driver.FindElement(By.Id("password")).SendKeys(password);
            driver.FindElement(By.Id("confirm-password")).Clear();
            driver.FindElement(By.Id("confirm-password")).SendKeys(password);

            driver.FindElement(By.XPath("/html/body/div[1]/div/div/form")).Submit();

            var submitWait = new WebDriverWait(driver, TimeSpan.FromSeconds(15));
            submitWait.Until(_ =>
            {
                if (!driver.Url.Contains("register"))
                {
                    emailOk = true;
                    TestDataStore.CurrentCredentials = new Credentials(email, password);
                    return true;
                }

                try
                {
                    var alert = driver.FindElement(By.CssSelector("[role='alert']"));
                    if (alert.Text.Contains("already registered"))
                    {
                        return true;
                    }
                }
                catch (NoSuchElementException) { }

                return false;
            });
        }

        return TestDataStore.CurrentCredentials!;
    }
}
