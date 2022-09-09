function CallGetPassword(){
	var s = document.getElementById("seqnum");
	if (s.value.length == 0) s.value = "1";
  	var f = { 	domain 	: document.getElementById("domain").value,
  			user 	: document.getElementById("user").value,
  			password: document.getElementById("password").value,
  			secret	: document.getElementById("secret").value,
  			seqnum	: document.getElementById("seqnum").value};
  	return GetPasswordForm(f);
}
function CalcPasswordStrength(p)
{
  var symbols = 0;
  var numbers = 0;
  var lettersLower = 0;
  var lettersUpper = 0;
  var unicodeMin = 0;
  var unicodeMax = 0;
  var length = 0;
  for(var i=0; i< p.length;i++)
  {
        if (i == 0)
           length += 1;
        else if (p.charAt(i) == p.charAt(i - 1))
           length += 0.1;
        else if (Math.abs(p.charCodeAt(i) - p.charCodeAt(i-1)) < 4)
           length += (0.1 + 0.2 * Math.abs(p.charCodeAt(i) - p.charCodeAt(i-1)));
        else if (p.charCodeAt(i) > 128)
        {
           length += 1;
           if (unicodeMin == 0 || unicodeMin > (p.charCodeAt(i)-10))
           	unicodeMin = p.charCodeAt(i)-10;
           if (unicodeMax < (p.charCodeAt(i)+10))
           	unicodeMax = p.charCodeAt(i)+10;
        }
        else
           length += 1;
           
	if (p.charAt(i) >= '0' && p.charAt(i) <= '9')
	{
	numbers++;
	}
	else if (p.charAt(i) >= 'a' && p.charAt(i) <= 'z')
	{
	lettersLower++;
	}
	else if (p.charAt(i) >= 'A' && p.charAt(i) <= 'Z')
	{
	lettersUpper++;
	}
	else
	{
	symbols++;
	}
  }
  var total = 0;
  if (symbols > 0)
    total += 10;
  if (numbers > 0)
    total += 10;
  if (lettersLower > 0)
    total += 26;
  if (lettersUpper > 0)
    total += 26;
  total += (unicodeMax - unicodeMin);
  if (total == 0) return 0;
  return Math.round(Math.log(total) * Math.LOG2E * length);
}
