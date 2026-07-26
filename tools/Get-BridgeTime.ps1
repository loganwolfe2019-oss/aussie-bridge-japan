# Get-BridgeTime.ps1
# Shows the current time in Sydney and Tokyo, and the gap between them.

$zones = @(
    @{ City = 'Sydney'; Id = 'AUS Eastern Standard Time' }
    @{ City = 'Tokyo';  Id = 'Tokyo Standard Time' }
)

$utcNow = [DateTime]::UtcNow
$times = foreach ($zone in $zones) {
    $tz = [TimeZoneInfo]::FindSystemTimeZoneById($zone.Id)
    [PSCustomObject]@{
        City      = $zone.City
        LocalTime = [TimeZoneInfo]::ConvertTimeFromUtc($utcNow, $tz)
        Offset    = $tz.GetUtcOffset($utcNow)
    }
}

$times | Format-Table City, @{ Label = 'Local time'; Expression = { $_.LocalTime.ToString('ddd HH:mm') } }, @{ Label = 'UTC offset'; Expression = { $_.Offset.ToString() } } -AutoSize

$gap = ($times[0].Offset - $times[1].Offset).TotalHours
Write-Host ("Sydney is {0} hour(s) ahead of Tokyo right now." -f $gap)
