using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;


namespace VidateTests
{

    public class Tests
    {
        WebDriver driver;


        [SetUp]
        public void Setup()
        {
            driver = new ChromeDriver();
        }

        [Test]
        public void Test1()
        {
            driver.Url = "https://www.google.com";
            driver.FindElement(By.Name("q")).SendKeys("webdriver" + Keys.Return);
            Console.WriteLine(driver.Title);
        }


        [TearDown]
        public void TearDown()
        {
            driver.Dispose();
        }
    }
}
