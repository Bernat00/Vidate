using System.Timers;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.Extensions;
using OpenQA.Selenium.Support.UI;


namespace VidateTests
{

    [TestFixture, Order(0)]
    public class Basics: BaseTest
    {
        

        [Test]
        public void ServerRunning()
        {
            Navigate("");
            Assert.That(driver.FindElement(By.Id("root")).Displayed == true);
        }

        [Test]
        public void Register() {
            Navigate("/register");
            Data.credintials.Email = $"test{r.Next(0, 10000)}@example.com";
            Data.credintials.Password = $"Password{r.Next(0,100)}";


            bool emailOk = false;

            while (!emailOk)
            {
                driver.FindElement(By.Id("email")).SendKeys(Data.credintials.Email);
                driver.FindElement(By.Id("password")).SendKeys(Data.credintials.Password);
                driver.FindElement(By.Id("confirm-password")).SendKeys(Data.credintials.Password);

                
                driver.FindElement(By.XPath("/html/body/div[1]/div/div/form")).Submit();

                WebDriverWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(15));
                wait.Until(d =>
                {
                    if (!driver.Url.Contains("register"))
                    {
                        emailOk = true;
                        return true;
                    }

                    if(driver.FindElement(By.XPath("/html/body/div[1]/div/div/div[2]")).Text == "This email is already registered.")
                    {
                        return true;
                    }

                    return false;
                }); 
            }


            Assert.That(driver.Url.Contains("setup-profile"));
            
        }


        public void ProfileSetup(string? fNmae, string? mName, string? lName, DateOnly bDate)
        {
            //todo record with selenium (create test cases with llm
        }


        
    }
}
