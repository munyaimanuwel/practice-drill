using StringCalculator;

Console.WriteLine("Enter numbers (comma or newline separated), or 'q' to quit:");
while (true)
{
    var line = Console.ReadLine();
    if (line == null || line == "q") break;
    Console.WriteLine(Calculator.Add(line));
}
