using System;
using System.Collections.Generic;
using System.Text;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

namespace VidateTests
{
    public class BaseTest
    {
        protected WebDriver driver;
        protected readonly Random r = new Random();


        protected void Navigate(string subEndpoindThing)
        {
            driver.Navigate().GoToUrl(Data.BASE_URL + subEndpoindThing);
        }



        [SetUp]
        public void Setup()
        {
            driver = new ChromeDriver();
        }


        [TearDown]
        public void TearDown()
        {
            driver.Dispose();
        }
    }
}
