#!/bin/bash

# Define variables
url=""
source "$(dirname "$0")/env.sh"
load_env_url
echo "Using URL: $url"

token=""
username=""
email1="hookt@oregonstate.edu"
emalil2="hooktristanshs@gmail.com"
email3="tristanskyhook@gmail.com"

# Special functions for signup and login
signup() {
    local user=$1
    local password=$2
    local email=$3

    # Perform signup
    local response=$(curl -s -w "\n%{http_code}" \
        -X 'POST' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        -d "{\"username\":\"$user\", \"password\":\"$password\", \"email\":\"$email\"}" \
        "$url/signup")

    # Separate response body and HTTP status code
    local body=$(echo "$response" | sed '$d')
    local status_code=$(echo "$response" | tail -n1)

    # Debugging output
    echo "Signup response body: $body"
    echo "Signup HTTP status code: $status_code"

    # Check if signup was successful
    if [[ "$status_code" == "200" ]]; then
        echo "Signup successful"
        login "$user" "$password"
        return
    elif [[ $(echo "$body" | jq -r '.message') == "User already exists" ]]; then
        echo "User already exists, logging in"
        login "$user" "$password"
        return
    else
        echo "Signup failed: $body"
        exit 1
    fi
}

login() {
    local user=$1
    local password=$2
    
    # Perform login
    local response=$(curl -X 'POST' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        -d "{\"username\":\"$user\", \"password\":\"$password\"}" \
        "$url/login")

    # Check if login was successful
    echo "Login response: $response"
    if [[ $(echo "$response" | jq -r '.token') != "null" ]]; then
        echo "Login successful"
    else
        echo "Login failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi
    # Extract token and username from the response
    token=$(echo "$response" | jq -r '.token')
    username=$(echo "$response" | jq -r '.username')
    # Check if token and username are not empty
    if [[ -z "$token" || -z "$username" ]]; then
        echo "Failed to extract token or username from login response"
        exit 1
    fi
    # Store token and username in environment variables
    export TOKEN="$token"
    export USERNAME="$username"
}

get_user() {
    local user=$1

    # Perform GET request with token
    local response=$(curl -X 'GET' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        "$url/users/$user")

    # Check if GET request was successful
    if [[ $(echo "$response" | jq -r '.username') == "$user" ]]; then
        echo "GET request successful"
    else
        echo "GET request failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi
}

update_user() {
    local user=$1
    local content=$2

    # Perform POST request with token
    local response=$(curl -X 'POST' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"content\":$content}" \
        "$url/users/$user")
        
    # Check if POST request was successful
    if [[ $(echo "$response" | jq -r '.username') == "$user" ]]; then
        echo "POST request successful"
    else
        echo "POST request failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi
}

delete_user() {
    local user=$1

    # Perform DELETE request with token
    local response=$(curl -X 'DELETE' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        "$url/users/$user")

    # Check if DELETE request was successful
    if [[ $(echo "$response" | jq -r '.message') == "User deleted successfully" ]]; then
        echo "DELETE request successful"
    else
        echo "DELETE request failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi
    # Clear token and username after deletion
    token=""
    username=""
}


# CRUD operations
put_world() {
    local world_name=$1
    local world_content=$2
    local world_description='a sample description for the world'
    local world_image='https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Hercules_beetle_%28larva%29.jpg/330px-Hercules_beetle_%28larva%29.jpg'
    local wolrd_style=''
    local world_id=''
    local world_tags=$3
    local world_parentId=''
    local world_ownerId=''
    local world_collections=[]

    echo "World name: $world_name"
    echo "World content: $world_content"
    echo "World tags: $world_tags"
    echo "Token: $token"

    # Perform PUT request
    local response=$(curl -X 'PUT' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$world_name\", \"content\":$world_content, \"description\":\"$world_description\", \"image\":\"$world_image\", \"style\":\"$wolrd_style\", \"id\":\"$world_id\", \"tags\":$world_tags, \"parentId\":\"$world_parentId\", \"ownerId\":\"$world_ownerId\", \"collections\":$world_collections}" \
        "$url/worlds")

    # Check if PUT request was successful
    echo "World response: $response"
    if [[ $(echo "$response" | jq -r '.name') == "$world_name" ]]; then
        echo "PUT request successful"
    else
        echo "PUT request failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi
}

get_world() {
    local world=$(echo "$1" | jq -sRr @uri)

    # Perform GET request
    local response=$(curl -X 'GET' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        "$url/$world")
    # Check if GET request was successful
    echo "World response: $response"
    if [[ $(echo "$response" | jq -r '.name') == "$1" ]]; then
        echo "GET request successful"
    else
        echo "GET request failed: $(echo "$response" | jq -r '.name')"
        exit 1
    fi
}

post_world() {
    local world_name=$1
    local world_content=$2
    
    # Perform POST request
    local response=$(curl -X 'POST' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$world_name\", \"content\":$world_content}" \
        "$url/$world_name")

    # Check if POST request was successful
    echo "World response: $response"
    if [[ $(echo "$response" | jq -r '.name') == "$world_name" ]]; then
        echo "POST request successful"
    else
        echo "POST request failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi
}

delete_world() {
    local world=$(echo "$1" | jq -sRr @uri)

    # Perform DELETE request
    local response=$(curl -X 'DELETE' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        "$url/$world")

    # Check if DELETE request was successful
    echo "World response: $response"
    if [[ $(echo "$response" | jq -r '.message') == "World deleted successfully" ]]; then
        echo "DELETE request successful"
    else
        echo "DELETE request failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi
}

put_collection() {
    local collection_name=$1
    local collection_content=$2
    local collection_id=''
    local collection_tags=$3
    local collection_parentId=$4
    local collection_ownerId=''
    local collection_collections=[]
    local collection_entries=[]
    local world=$(echo "$4" | jq -sRr @uri)
    
    # Perform PUT request
    local response=$(curl -X 'PUT' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$collection_name\", \"content\":$collection_content, \"tags\":$collection_tags, \"parentId\":\"$collection_parentId\", \"ownerId\":\"$collection_ownerId\", \"collections\":$collection_collections, \"entries\":$collection_entries}" \
        "$url/$world")

    echo "Collection response: $response"
    # Check if PUT request was successful
    if [[ $(echo "$response" | jq -r '.name') == "$collection_name" ]]; then
        echo "PUT request successful"
    else
        echo "PUT request failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi
}

get_collection() {
    local collection=$(echo "$1" | jq -sRr @uri)
    local world=$(echo "$2" | jq -sRr @uri)

    # Perform GET request
    local response=$(curl -X 'GET' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        "$url/$world/$collection")
    # Check if GET request was successful
    echo "Collection response: $response"
    if [[ $(echo "$response" | jq -r '.name') == "$1" ]]; then
        echo "GET request successful"
    else
        echo "GET request failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi
}

post_collection() {
    local collection_name=$1
    local collection_content=$2
    local world=$(echo "$3" | jq -sRr @uri)

    # Perform POST request
    local response=$(curl -X 'POST' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$collection_name\", \"content\":$collection_content}" \
        "$url/$world")

    echo "Collection response: $response"
    # Check if POST request was successful
    if [[ $(echo "$response" | jq -r '.name') == "$collection_name" ]]; then
        echo "POST request successful"
    else
        echo "POST request failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi
}

delete_collection() {
    local collection=$(echo "$1" | jq -sRr @uri)
    local world=$(echo "$2" | jq -sRr @uri)

    # Perform DELETE request
    local response=$(curl -X 'DELETE' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        "$url/$world/$collection")

    echo "Collection response: $response"
    # Check if DELETE request was successful
    if [[ $(echo "$response" | jq -r '.message') == "Collection deleted successfully" ]]; then
        echo "DELETE request successful"
    else
        echo "DELETE request failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi
}

put_entry() {
    local entry_name=$1
    local entry_content=$2
    local entry_id=''
    local entry_tags=$3
    local entry_parentId=$4
    local entry_ownerId=''
    local collection=$(echo "$4" | jq -sRr @uri)
    local world=$(echo "$5" | jq -sRr @uri)

    echo "url: $url"
    
    # Perform PUT request
    local response=$(curl -X 'PUT' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$entry_name\", \"content\":$entry_content, \"tags\":$entry_tags, \"parentId\":\"$entry_parentId\", \"ownerId\":\"$entry_ownerId\"}" \
        "$url/$world/$collection")
    # Check if PUT request was successful
    if [[ $(echo "$response" | jq -r '.name') == "$entry_name" ]]; then
        echo "PUT request successful"
    else
        echo "PUT request failed: $(echo "$response" | jq -r '.name')"
        exit 1
    fi
}

get_entry() {
    local entry=$(echo "$1" | jq -sRr @uri)
    local collection=$(echo "$2" | jq -sRr @uri)
    local world=$(echo "$3" | jq -sRr @uri)

    # Perform GET request
    local response=$(curl -X 'GET' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        "$url/$world/$collection/$entry")
    # Check if GET request was successful
    if [[ $(echo "$response" | jq -r '.name') == "$1" ]]; then
        echo "GET request successful"
    else
        echo "GET request failed: $(echo "$response")"
        exit 1
    fi
}

post_entry() {
    local entry_name=$1
    local entry_content=$2
    local collection=$(echo "$3" | jq -sRr @uri)
    local world=$(echo "$4" | jq -sRr @uri)

    # Perform POST request
    local response=$(curl -X 'POST' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$entry_name\", \"content\":$entry_content}" \
        "$url/$world/$collection")

    # Check if POST request was successful
    if [[ $(echo "$response" | jq -r '.name') == "$entry_name" ]]; then
        echo "POST request successful"
    else
        echo "POST request failed: $(echo "$response")"
        exit 1
    fi
}

delete_entry() {
    local entry=$(echo "$1" | jq -sRr @uri)
    local collection=$(echo "$2" | jq -sRr @uri)
    local world=$(echo "$3" | jq -sRr @uri)

    # Perform DELETE request
    local response=$(curl -X 'DELETE' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        "$url/$world/$collection/$entry")

    # Check if DELETE request was successful
    if [[ $(echo "$response" | jq -r '.message') == "Entry deleted successfully" ]]; then
        echo "DELETE request successful"
    else
        echo "DELETE request failed: $(echo "$response")"
        exit 1
    fi
}