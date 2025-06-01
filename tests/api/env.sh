load_env_url() {
    local env_file="$(dirname "$0")/../../.env"
    if [[ -f "$env_file" ]]; then
        # Extract the URL from the .env file
        url=$(grep -E '^PUBLIC_API_URL=' "$env_file" | cut -d '=' -f 2)
        if [[ -z "$url" ]]; then
            echo "Error: 'url' not found in $env_file" >&2
            exit 1
        fi
        echo "$url" # Return the URL
    else
        echo "Error: .env file not found at $env_file" >&2
        exit 1
    fi
}