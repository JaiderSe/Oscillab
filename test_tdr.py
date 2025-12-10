import requests
import base64

files_to_test = [
    'Csv/taller 1/CSV.csv',
    'Csv/taller 3/CSV.csv',
    'Csv/taller 3/SDS00001.csv'
]

for file_path in files_to_test:
    print(f"Testing {file_path}")
    try:
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {'cable_length': 10.0}
            response = requests.post('http://localhost:8000/analyze-tdr', files=files, data=data)
            response.raise_for_status()
            result = response.json()

            expected_fields = ['length_meters', 'error_percent', 'velocity_factor', 'vswr', 'reflection_coefficient', 'beta', 'alpha', 'Z0', 'load_type', 'load_value', 'tdr_plot_base64']
            missing_fields = [field for field in expected_fields if field not in result]

            api_works = True
            if missing_fields:
                print(f"Missing fields: {missing_fields}")
                api_works = False
            else:
                print("All expected fields present.")

            # Check base64
            if 'tdr_plot_base64' in result:
                try:
                    decoded = base64.b64decode(result['tdr_plot_base64'])
                    if decoded.startswith(b'\x89PNG'):
                        print("tdr_plot_base64 is valid PNG base64.")
                    else:
                        print("tdr_plot_base64 is not a valid PNG.")
                        api_works = False
                except Exception as e:
                    print(f"Error decoding base64: {e}")
                    api_works = False
            else:
                api_works = False

            if api_works:
                print("API works correctly for this file.")
            else:
                print("API does not work correctly for this file.")

    except requests.exceptions.RequestException as e:
        print(f"HTTP error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response text: {e.response.text}")
    except Exception as e:
        print(f"Other error: {e}")
    print()