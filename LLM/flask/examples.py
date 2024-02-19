"""
    This array consist of input-query examples to feed into the model. 
    Add more related examples for the model.
"""

examples = [
    {
        "input": "find lead whose follow up time is expired or greater then current time and status is in progress",
        "query": "SELECT * FROM lead_managements WHERE CASE WHEN overdue_at IS NOT NULL AND overdue_at < NOW() AND status = 2 THEN 1 ELSE 0 END = 1;"
    },
    {
        "input": "Give me contact details of the client Cyprus",
        "query": "SELECT contact, email, primary_person_name, primary_mobile_number, primary_landline, primary_email from clients WHERE client_name = 'Cyprus'"
    },
    {
        "input": "Get all leads",
        "query": "SELECT * FROM lead_managements;"
    }
]