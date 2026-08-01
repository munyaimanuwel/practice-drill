using StringCalculator;
using Xunit;

public class CalculatorTests
{
    [Fact]
    public void Add_EmptyString_ReturnsZero()
    {
        Assert.Equal(0, Calculator.Add(""));
    }

    [Fact]
    public void Add_SingleNumber_ReturnsIt()
    {
        Assert.Equal(1, Calculator.Add("1"));
    }

    [Fact]
    public void Add_TwoNumbers_ReturnsSum()
    {
        Assert.Equal(3, Calculator.Add("1,2"));
    }
}
