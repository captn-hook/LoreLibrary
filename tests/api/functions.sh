#!/bin/bash

# Define variables
url=""
source "$(dirname "$0")/env.sh"
load_env_url

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

    # Check if signup was successful
    if [[ "$status_code" == "200" ]]; then
    # Extract token and username from the response
        token=$(echo "$response" | jq -r '.token')
        username=$(echo "$response" | jq -r '.username')
        # Check if token and username are not empty
        if [[ -z "$token" || -z "$username" ]]; then
            echo -e "\nFailed to extract token or username from login response"
            exit 1
        fi
        # Store token and username in environment variables
        export TOKEN="$token"
        export USERNAME="$username"
        
        echo -n '.'
        return
        
    elif [[ $(echo "$body" | jq -r '.message') == "User already exists" ]]; then
        login "$user" "$password"
        return
    else
        echo -e "\nSignup failed: $body"
        exit 1
    fi
}

login() {
    local user=$1
    local password=$2
    
    # Perform login
    local response=$(curl -s -X 'POST' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        -d "{\"username\":\"$user\", \"password\":\"$password\"}" \
        "$url/login")

    # Check if login was successful
    if [[ $(echo "$response" | jq -r '.token') != "null" ]]; then
        echo -n '.'
    else
        echo -e "\nLogin failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi
    # Extract token and username from the response
    token=$(echo "$response" | jq -r '.token')
    username=$(echo "$response" | jq -r '.username')
    # Check if token and username are not empty
    if [[ -z "$token" || -z "$username" ]]; then
        echo -e "\nFailed to extract token or username from login response"
        exit 1
    fi
    # Store token and username in environment variables
    export TOKEN="$token"
    export USERNAME="$username"
}

get_user() {
    local user=$1

    # Perform GET request with token
    local response=$(curl -s -X 'GET' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        "$url/users/$user")

    # Check if GET request was successful
    if [[ $(echo "$response" | jq -r '.username') == "$user" ]]; then
        echo -n '.'
    else
        echo -e "\nGET /users/username request failed: $(echo "$response" | jq -r '.username')"
        exit 1
    fi
}

update_user() {
    local user=$1
    local content=$2

    # Perform POST request with token
    local response=$(curl -s -X 'POST' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"content\":$content}" \
        "$url/users/$user")
        
    # Check if POST request was successful
    if [[ $(echo "$response" | jq -r '.username') == "$user" ]]; then
        echo -n '.'
    else
        echo -e "\nPOST /users/username request failed: $(echo "$response" | jq -r '.username')"
        exit 1
    fi
}

delete_user() {
    local user=$1

    # Perform DELETE request with token
    local response=$(curl -s -X 'DELETE' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        "$url/users/$user")

    # Check if DELETE request was successful
    if [[ $(echo "$response" | jq -r '.message') == "User deleted successfully" ]]; then
        echo -n '.'
    else
        echo -e "\nDELETE /users/username request failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi
    # Clear token and username after deletion
    token=""
    username=""
}

# Get all /worlds
get_worlds() {
    # Perform GET request
    local response=$(curl -s -X 'GET' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        "$url/worlds")

    # Check if GET request was successful (it should return a JSON array)
    if [[ $(echo "$response" | jq -r 'type') == "array" ]]; then
        echo -n '.'
    else
        echo -e "\nGET /worlds request failed: $(echo "$response")"
        exit 1
    fi
}

# Get all /users (requires authentication)
get_users() {
    # Perform GET request with token
    local response=$(curl -s -X 'GET' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        "$url/users")

    # Check if GET request was successful
    if [[ $(echo "$response" | jq -r 'type') == "array" ]]; then
        echo -n '.'
    else
        echo -e "\nGET /users request failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi
}


# CRUD operations
put_world() {
    local world_name=$1
    local world_content=$2
    local world_description='a sample description for the world'
    local world_image='https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Hercules_beetle_%28larva%29.jpg/330px-Hercules_beetle_%28larva%29.jpg'
    local world_style=''
    local world_id=''
    local world_tags=$3
    local world_parentId=''
    local world_ownerId=''
    local world_collections=[]

    local succeed=$4
    # if succeed is not provided, default to true
    if [[ -z "$succeed" ]]; then
        succeed=true
    fi

    # Perform PUT request
    local response=$(curl -s -X 'PUT' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$world_name\", \"content\":$world_content, \"description\":\"$world_description\", \"image\":\"$world_image\", \"style\":\"$world_style\", \"id\":\"$world_id\", \"tags\":$world_tags, \"parentId\":\"$world_parentId\", \"ownerId\":\"$world_ownerId\", \"collections\":$world_collections}" \
        "$url/worlds")


    if [[ "$succeed" == true ]]; then
        # Check if PUT request was successful
        if [[ $(echo "$response" | jq -r '.name') == "$world_name" ]]; then
            echo -n '.'
        else
            echo -e "\nPUT /worlds request failed: $(echo "$response" | jq -r '.message')"
            exit 1
        fi
    else
        # Check if PUT request was a failure
        if [[ $(echo "$response" | jq -r '.name') == "$world_name" ]]; then
            echo -e "\nPUT /worlds request succeeded, but it should have failed: $(echo "$response")"
            exit 1
        else
            echo -n '.'
        fi
    fi
}

get_world() {
    local world=$(echo "$1" | jq -sRr @uri)
    local succeed=$2
    if [[ -z "$succeed" ]]; then
        succeed=true
    fi

    # Perform GET request
    local response=$(curl -s -X 'GET' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        "$url/$world")
    
    if [[ "$succeed" == true ]]; then
        # Check if GET request was successful
        if [[ $(echo "$response" | jq -r '.name') == "$1" ]]; then
            echo -n '.'
        else
            echo -e "\nGET /worldId request failed: $(echo "$response" | jq -r '.name')"
            exit 1
        fi
    else
        # Check if GET request was a failure
        if [[ $(echo "$response" | jq -r '.name') == "$1" ]]; then
            echo -e "\nGET /worldId request succeeded, but it should have failed: $(echo "$response" | jq -r '.message')"
            exit 1
        else
            echo -n '.'
        fi
    fi
}

get_world_map() {
    local world=$(echo "$1" | jq -sRr @uri)

    # Perform GET request
    local response=$(curl -s -X 'GET' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        "$url/$world?map=true")
    # Check if GET request was successful
    if [[ $(echo "$response" | jq -r 'type') == "object" ]]; then
        echo -n '.'
    else
        echo -e "\nGET /worldId?map=true request failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi
}

post_world() {
    local world_name=$1
    local world_content=$2
    local succeed=$3
    if [[ -z "$succeed" ]]; then
        succeed=true
    fi
    
    # Perform POST request
    local response=$(curl -s -X 'POST' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$world_name\", \"content\":$world_content}" \
        "$url/$world_name")

    if [[ "$succeed" == true ]]; then
        # Check if POST request was successful
        if [[ $(echo "$response" | jq -r '.name') == "$world_name" ]]; then
            echo -n '.'
        else
            echo -e "\nPOST /worldId request failed: $(echo "$response" | jq -r '.message')"
            exit 1
        fi
    else
        # Check if POST request was a failure
        if [[ $(echo "$response" | jq -r '.name') == "$world_name" ]]; then
            echo -e "\nPOST /worldId request succeeded, but it should have failed: $(echo "$response" | jq -r '.message')"
            exit 1
        else
            echo -n '.'
        fi
    fi
}

delete_world() {
    local world=$(echo "$1" | jq -sRr @uri)

    # Perform DELETE request
    local response=$(curl -s -X 'DELETE' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        "$url/$world")

    # Check if DELETE request was successful
    if [[ $(echo "$response" | jq -r '.message') == "World deleted successfully" ]]; then
        echo -n '.'
    else
        echo -e "\nDELETE /worldId request failed: $(echo "$response" | jq -r '.message')"
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
    local succeed=$5
    if [[ -z "$succeed" ]]; then
        succeed=true
    fi
    
    # Perform PUT request
    local response=$(curl -s -X 'PUT' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$collection_name\", \"content\":$collection_content, \"tags\":$collection_tags, \"parentId\":\"$collection_parentId\", \"ownerId\":\"$collection_ownerId\", \"collections\":$collection_collections, \"entries\":$collection_entries}" \
        "$url/$world")

    if [[ "$succeed" == true ]]; then
        # Check if PUT request was successful
        if [[ $(echo "$response" | jq -r '.name') == "$collection_name" ]]; then
            echo -n '.'
        else
            echo -e "\nPUT /worldId request failed: $(echo "$response" | jq -r '.message')"
            exit 1
        fi
    else
        # Check if PUT request was a failure
        if [[ $(echo "$response" | jq -r '.name') == "$collection_name" ]]; then
            echo -e "\nPUT /worldId request succeeded, but it should have failed: $(echo "$response")"
            exit 1
        else
            echo -n '.'
        fi
    fi
}

get_collection() {
    local collection=$(echo "$1" | jq -sRr @uri)
    local world=$(echo "$2" | jq -sRr @uri)
    local succeed=$3

    if [[ -z "$succeed" ]]; then
        succeed=true
    fi

    # Perform GET request
    local response=$(curl -s -X 'GET' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        "$url/$world/$collection")
    # Check if GET request was successful
    if [[ "$succeed" == true ]]; then
        if [[ $(echo "$response" | jq -r '.name') == "$1" ]]; then
            echo -n '.'
        else
            echo -e "\nGET /worldId/collectionId request failed: $(echo "$response" | jq -r '.message')"
            exit 1
        fi
    else
        # Check if GET request was a failure
        if [[ $(echo "$response" | jq -r '.name') == "$1" ]]; then
            echo -e "\nGET /worldId/collectionId request succeeded, but it should have failed: $(echo "$response" | jq -r '.message')"
            exit 1
        else
            echo -n '.'
        fi
    fi
}

post_collection() {
    local collection_name=$1
    local collection_content=$2
    local world=$(echo "$3" | jq -sRr @uri)
    local succeed=$4
    if [[ -z "$succeed" ]]; then
        succeed=true
    fi

    # Perform POST request
    local response=$(curl -s -X 'POST' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$collection_name\", \"content\":$collection_content}" \
        "$url/$world")

    if [[ "$succeed" == true ]]; then
        # Check if POST request was successful
        if [[ $(echo "$response" | jq -r '.name') == "$collection_name" ]]; then
            echo -n '.'
        else
            echo -e "\nPOST /worldId/collectionId request failed: $(echo "$response" | jq -r '.message')"
            exit 1
        fi
    else
        # Check if POST request was a failure
        if [[ $(echo "$response" | jq -r '.name') == "$collection_name" ]]; then
            echo -e "\nPOST /worldId/collectionId request succeeded, but it should have failed: $(echo "$response" | jq -r '.message')"
            exit 1
        else
            echo -n '.'
        fi
    fi
}

delete_collection() {
    local collection=$(echo "$1" | jq -sRr @uri)
    local world=$(echo "$2" | jq -sRr @uri)

    # Perform DELETE request
    local response=$(curl -s -X 'DELETE' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        "$url/$world/$collection")

    # Check if DELETE request was successful
    if [[ $(echo "$response" | jq -r '.message') == "Collection deleted successfully" ]]; then
        echo -n '.'
    else
        echo -e "\nDELETE /worldId/collectionId request failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi
}

put_subcollection() {
    local collection_name=$1
    local collection_content=$2
    local collection_id=''
    local collection_tags=$3
    local collection_parentId=$4
    local collection_ownerId=''
    local collection_collections=[]
    local collection_entries=[]
    local parent_collection=$(echo "$4" | jq -sRr @uri)
    local world=$(echo "$5" | jq -sRr @uri)
    local succeed=$6
    if [[ -z "$succeed" ]]; then
        succeed=true
    fi
    # Perform PUT request
    local response=$(curl -s -X 'PUT' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$collection_name\", \"content\":$collection_content, \"tags\":$collection_tags, \"parentId\":\"$collection_parentId\", \"ownerId\":\"$collection_ownerId\", \"collections\":$collection_collections, \"entries\":$collection_entries}" \
        "$url/$world/$parent_collection")

    if [[ "$succeed" == true ]]; then
        # Check if PUT request was successful
        if [[ $(echo "$response" | jq -r '.name') == "$collection_name" ]]; then
            echo -n '.'
        else
            echo -e "\nPUT /worldId/collectionId subcol request failed: $(echo "$response" | jq -r '.message')"
            exit 1
        fi
    else
        # Check if PUT request was a failure
        if [[ $(echo "$response" | jq -r '.name') == "$collection_name" ]]; then
            echo -e "\nPUT /worldId/collectionId subcol request succeeded, but it should have failed: $(echo "$response")"
            exit 1
        else
            echo -n '.'
        fi
    fi
}

get_subcollection() {
    local collection=$(echo "$1" | jq -sRr @uri)
    local parent_collection=$(echo "$2" | jq -sRr @uri)
    local world=$(echo "$3" | jq -sRr @uri)
    local succeed=$4
    if [[ -z "$succeed" ]]; then
        succeed=true
    fi

    # Perform GET request
    local response=$(curl -s -X 'GET' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \dele
        "$url/$world/$parent_collection/$collection")
    
    if [[ "$succeed" == true ]]; then
        # Check if GET request was successful
        if [[ $(echo "$response" | jq -r '.name') == "$1" ]]; then
            echo -n '.'
        else
            echo -e "\nGET /worldId/collectionId request failed: $(echo "$response")"
            exit 1
        fi
    else
        # Check if GET request was a failure
        if [[ $(echo "$response" | jq -r '.name') == "$1" ]]; then
            echo -e "\nGET /worldId/collectionId request succeeded, but it should have failed: $(echo "$response")"
            exit 1
        else
            echo -n '.'
        fi
    fi
}

post_subcollection() {
    local collection_name=$1
    local collection_content=$2
    local parent_collection=$(echo "$3" | jq -sRr @uri)
    local world=$(echo "$4" | jq -sRr @uri)
    local succeed=$5
    if [[ -z "$succeed" ]]; then
        succeed=true
    fi

    # Perform POST request
    local response=$(curl -s -X 'POST' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$collection_name\", \"content\":$collection_content}" \
        "$url/$world/$parent_collection")

    if [[ "$succeed" == true ]]; then
        # Check if POST request was successful
        if [[ $(echo "$response" | jq -r '.name') == "$collection_name" ]]; then
            echo -n '.'
        else
            echo -e "\nPOST /worldId/collectionId request failed: $(echo "$response")"
            exit 1
        fi
    else
        # Check if POST request was a failure
        if [[ $(echo "$response" | jq -r '.name') == "$collection_name" ]]; then
            echo -e "\nPOST /worldId/collectionId request succeeded, but it should have failed: $(echo "$response")"
            exit 1
        else
            echo -n '.'
        fi
    fi
}

delete_subcollection() {
    local collection=$(echo "$1" | jq -sRr @uri)
    local parent_collection=$(echo "$2" | jq -sRr @uri)
    local world=$(echo "$3" | jq -sRr @uri)

    # Perform DELETE request
    local response=$(curl -s -X 'DELETE' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        "$url/$world/$parent_collection/$collection")

    # Check if DELETE request was successful
    if [[ $(echo "$response" | jq -r '.message') == "Collection deleted successfully" ]]; then
        echo -n '.'
    else
        echo -e "\nDELETE /worldId/collectionId request failed: $(echo "$response")"
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
    local succeed=$6
    if [[ -z "$succeed" ]]; then
        succeed=true
    fi
    
    # Perform PUT request
    local response=$(curl -s -X 'PUT' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$entry_name\", \"content\":$entry_content, \"tags\":$entry_tags, \"parentId\":\"$entry_parentId\", \"ownerId\":\"$entry_ownerId\"}" \
        "$url/$world/$collection")

    
    if [[ "$succeed" == true ]]; then
        # Check if PUT request was successful
        if [[ $(echo "$response" | jq -r '.name') == "$entry_name" ]]; then
            echo -n '.'
        else
            echo -e "\nPUT /worldId/collectionId entry request failed: $(echo "$response" | jq -r '.name')"
            exit 1
        fi
    else
        # Check if PUT request was a failure
        if [[ $(echo "$response" | jq -r '.name') == "$entry_name" ]]; then
            echo -e "\nPUT /worldId/collectionId entry request succeeded, but it should have failed: $(echo "$response")"
            exit 1
        else
            echo -n '.'
        fi
    fi
}

put_entry_world() {
    local entry_name=$1
    local entry_content=$2
    local entry_id=''
    local entry_tags=$3
    local entry_parentId=$4
    local entry_ownerId=''
    local world=$(echo "$4" | jq -sRr @uri)
    local succeed=$5

    if [[ -z "$succeed" ]]; then
        succeed=true
    fi

    # Perform PUT request
    local response=$(curl -s -X 'PUT' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$entry_name\", \"content\":$entry_content, \"tags\":$entry_tags, \"parentId\":\"$entry_parentId\", \"ownerId\":\"$entry_ownerId\"}" \
        "$url/$world")
    if [[ "$succeed" == true ]]; then
        # Check if PUT request was successful
        if [[ $(echo "$response" | jq -r '.name') == "$entry_name" ]]; then
            echo -n '.'
        else
            echo -e "\nPUT /worldId entry request failed: $(echo "$response" | jq -r '.message')"
            exit 1
        fi
    else
        # Check if PUT request was a failure
        if [[ $(echo "$response" | jq -r '.name') == "$entry_name" ]]; then
            echo -e "\nPUT /worldId request succeeded, but it should have failed: $(echo "$response" | jq -r '.message')"
            exit 1
        else
            echo -n '.'
        fi
    fi
}

post_entry_word() {
    local entry_name=$1
    local entry_content=$2
    local world=$(echo "$3" | jq -sRr @uri)
    local succeed=$4
    if [[ -z "$succeed" ]]; then
        succeed=true
    fi

    # Perform POST request
    local response=$(curl -s -X 'POST' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$entry_name\", \"content\":$entry_content}" \
        "$url/$world")

    if [[ "$succeed" == true ]]; then
        # Check if POST request was successful
        if [[ $(echo "$response" | jq -r '.name') == "$entry_name" ]]; then
            echo -n '.'
        else
            echo -e "\nPOST /worldId request failed: $(echo "$response" | jq -r '.message')"
            exit 1
        fi
    else
        # Check if POST request was a failure
        if [[ $(echo "$response" | jq -r '.name') == "$entry_name" ]]; then
            echo -e "\nPOST /worldId request succeeded, but it should have failed: $(echo "$response" | jq -r '.message')"
            exit 1
        else
            echo -n '.'
        fi
    fi
}

get_entry_world() {
    local entry=$(echo "$1" | jq -sRr @uri)
    local world=$(echo "$2" | jq -sRr @uri)
    local succeed=$3
    if [[ -z "$succeed" ]]; then
        succeed=true
    fi

    # Perform GET request
    local response=$(curl -s -X 'GET' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        "$url/$world/$entry")
    
    if [[ "$succeed" == true ]]; then
        # Check if GET request was successful
        if [[ $(echo "$response" | jq -r '.name') == "$1" ]]; then
            echo -n '.'
        else
            echo -e "\nGET /worldId/entryId request failed: $(echo "$response")"
            exit 1
        fi
    else
        # Check if GET request was a failure
        if [[ $(echo "$response" | jq -r '.name') == "$1" ]]; then
            echo -e "\nGET /worldId/entryId request succeeded, but it should have failed: $(echo "$response")"
            exit 1
        else
            echo -n '.'
        fi
    fi
}

delete_entry_world() {
    local entry=$(echo "$1" | jq -sRr @uri)
    local world=$(echo "$2" | jq -sRr @uri)

    # Perform DELETE request
    local response=$(curl -s -X 'DELETE' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        "$url/$world/$entry")

    # Check if DELETE request was successful
    if [[ $(echo "$response" | jq -r '.message') == "Entry deleted successfully" ]]; then
        echo -n '.'
    else
        echo -e "\nDELETE /worldId/entryId request failed: $(echo "$response")"
        exit 1
    fi
}


get_entry() {
    local entry=$(echo "$1" | jq -sRr @uri)
    local collection=$(echo "$2" | jq -sRr @uri)
    local world=$(echo "$3" | jq -sRr @uri)
    local succeed=$4
    if [[ -z "$succeed" ]]; then
        succeed=true
    fi

    # Perform GET request
    local response=$(curl -s -X 'GET' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        "$url/$world/$collection/$entry")
    
    if [[ "$succeed" == true ]]; then
        # Check if GET request was successful
        if [[ $(echo "$response" | jq -r '.name') == "$1" ]]; then
            echo -n "."
        else
            echo -e "\nGET /worldId/collectionId/entryId request failed: $(echo "$response")"
            exit 1
        fi
    else
        # Check if GET request was a failure
        if [[ $(echo "$response" | jq -r '.name') == "$1" ]]; then
            echo -e "\nGET /worldId/collectionId/entryId request succeeded, but it should have failed: $(echo "$response")"
            exit 1
        else
            echo -n "."
        fi
    fi
}

post_entry() {
    local entry_name=$1
    local entry_content=$2
    local collection=$(echo "$3" | jq -sRr @uri)
    local world=$(echo "$4" | jq -sRr @uri)
    local succeed=$5
    if [[ -z "$succeed" ]]; then
        succeed=true
    fi

    # Perform POST request
    local response=$(curl -s -X 'POST' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        -d "{\"name\":\"$entry_name\", \"content\":$entry_content}" \
        "$url/$world/$collection/$entry_name")
    
    if [[ "$succeed" == true ]]; then
        # Check if POST request was successful
        if [[ $(echo "$response" | jq -r '.name') == "$entry_name" ]]; then
            echo -n '.'
        else
            echo -e "\nPOST /worldId/collectionId/entryId request failed: $(echo "$response")"
            exit 1
        fi
    else 
        # Check if POST request was a failure
        if [[ $(echo "$response" | jq -r '.name') == "$entry_name" ]]; then
            echo -e "\nPOST /worldId/collectionId/entryId request succeeded, but it should have failed: $(echo "$response")"
            exit 1
        else
            echo -n '.'
        fi
    fi
}

delete_entry() {
    local entry=$(echo "$1" | jq -sRr @uri)
    local collection=$(echo "$2" | jq -sRr @uri)
    local world=$(echo "$3" | jq -sRr @uri)

    # Perform DELETE request
    local response=$(curl -s -X 'DELETE' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        "$url/$world/$collection/$entry")

    # Check if DELETE request was successful
    if [[ $(echo "$response" | jq -r '.message') == "Entry deleted successfully" ]]; then
        echo -n '.'
    else
        echo -e "\nDELETE /worldId/collectionId/entryId request failed: $(echo "$response")"
        exit 1
    fi
}

reset() {
    # Reset the database
    local adminUserName=$1
    local adminPassword=$2
    
    local adminToken=''

    # Login as admin to get the token
    local response=$(curl -s -X 'POST' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        -d "{\"username\":\"$adminUserName\", \"password\":\"$adminPassword\"}" \
        "$url/login")

    # Check if login was successful
    if [[ $(echo "$response" | jq -r '.token') != "null" ]]; then
        adminToken=$(echo "$response" | jq -r '.token')
    else
        echo -e "\nLogin failed: $(echo "$response" | jq -r '.message')"
        exit 1
    fi

    # Get /users
    local response=$(curl -s -X 'GET' \
        -H 'accept: application/json' \
        -H "Authorization: $token" \
        -H 'Content-Type: application/json' \
        "$url/users")

    # Delete each user, the database should remove any worlds that belong to the user
    local users=$(echo "$response" | jq -r '.[].username')

    for user in $users; do
        if [[ "$user" != "$adminUserName" ]]; then
            local deleteResponse=$(curl -s -X 'DELETE' \
                -H 'accept: application/json' \
                -H "Authorization: $adminToken" \
                -H 'Content-Type: application/json' \
                "$url/users/$user")
            
            if [[ $(echo "$deleteResponse" | jq -r '.message') != "User deleted successfully" ]]; then
                echo -e "\nDELETE /users/username request failed: $(echo "$deleteResponse")"
                exit 1
            fi
        fi
    done
    echo "Users Cleared"
}