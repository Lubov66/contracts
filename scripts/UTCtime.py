from datetime import datetime, timedelta

# Get current UTC time
current_time_utc = datetime.utcnow()

# Calculate the time 3 hours and 44 minutes ago
time_difference = timedelta(hours=1, minutes=5)
target_time_utc = current_time_utc + time_difference

# Format the time in the desired format
formatted_time = target_time_utc.strftime('%Y-%m-%dT%H:%MZ')

print(formatted_time)