#!/bin/bash

# Define variables
url="https://hpwvv5xn81.execute-api.us-west-2.amazonaws.com/prod"
token=""
username=""
email1="hookt@oregonstate.edu"
email2="hooktristanshs@gmail.com"
email3="tristanskyhook@gmail.com"

# Special functions for signup and login
signup() {
    local user=$1
    local password=$2
    local email=$3
    
    # Perform signup
    local response=$(curl -X 'POST' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        -d "{\"username\":\"$user\", \"password\":\"$password\", \"email\":\"$email\"}" \
        "$url/signup")

    # Check if signup was successful
    echo "Signup response: $response"
    if [[ $(echo "$response" | jq -r '.username') == "$user" ]]; then
        echo "Signup successful"
        # Extract token and username from the response
        token=$(echo "$response" | jq -r '.token')
        username=$(echo "$response" | jq -r '.username')
        # Check if token and username are not empty
        if [[ -z "$token" || -z "$username" ]]; then
            echo "Failed to extract token or username from signup response"
            exit 1
        fi
        # Store token and username in environment variables
        export TOKEN="$token"
        export USERNAME="$username"
    # else if
    elif [[ $(echo "$response" | jq -r '.message') == "User already exists" ]]; then
        echo "User already exists, logging in"
        login "$user" "$password"
        return
    else
        echo "Signup failed: $(echo "$response")"
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

# World Information
world_name="Grim Dark Realm"
world_content=$(jq -n --arg text "Grim Dark Realm" --arg image_url "https://d2u4q3iydaupsp.cloudfront.net/P5WcUFv5CkArH0AKlkw7hYb66RIqlryep1l2roXFVFMKslvNjkyixCFsbIERPhZm67YQ7MpimatXgjciZc1M8zh46RsKAVgrsCoo782GizPFEFmBQus3IKS2CQCNChMk" --arg name "Grim Dark Realm" \
    '[{"text": $text}, {"image_url": $image_url}, {"name": $name}]')
world_tags='["grimdark", "fantasy", "werewolves", "vampires", "darkness"]'

# Collections
collection1_name="The Cursed Beasts"
collection1_content=$(jq -n --arg text "The Cursed Beasts are creatures of the night, cursed to roam the land in their monstrous forms. Werewolves are the most feared among them, driven by bloodlust and primal instincts." \
    '[{"text": $text}]')
collection1_tags='["werewolves", "beasts", "curse"]'

collection2_name="The Blood Lords"
collection2_content=$(jq -n --arg text "The Blood Lords are ancient vampires who rule the shadows. They are cunning, immortal, and feed on the blood of the living to sustain their power." \
    '[{"text": $text}]')
collection2_tags='["vampires", "lords", "darkness"]'

collection3_name="The Shadowlands"
collection3_content=$(jq -n --arg text "The Shadowlands are a desolate and cursed region where the sun never rises. It is home to both the Cursed Beasts and the Blood Lords, locked in an eternal struggle for dominance." \
    '[{"text": $text}]')
collection3_tags='["shadowlands", "darkness", "fantasy"]'

# Entries
entry1_name="Werewolf"
entry1_content=$(jq -n --arg text "Werewolves are cursed beings who transform into monstrous wolves under the full moon. They are driven by an insatiable hunger for flesh and are feared by all." \
    '[{"text": $text}]')
entry1_tags='["werewolf", "curse", "beast"]'

entry2_name="Vampire"
entry2_content=$(jq -n --arg text "Vampires are immortal creatures who feed on the blood of the living. They are masters of manipulation and thrive in the darkness, ruling over the Shadowlands." \
    '[{"text": $text}]')
entry2_tags='["vampire", "blood", "darkness"]'

entry3_name="The Moonlit Hunt"
entry3_content=$(jq -n --arg text "The Moonlit Hunt is a ritual where werewolves gather to hunt under the full moon. It is both a celebration of their primal nature and a terrifying event for those who cross their path." \
    '[{"text": $text}]')
entry3_tags='["werewolf", "hunt", "ritual"]'

entry4_name="The Crimson Throne"
entry4_content=$(jq -n --arg text "The Crimson Throne is the seat of power for the Blood Lords. It is said to be forged from the bones of their enemies and stained with the blood of countless victims." \
    '[{"text": $text}]')
entry4_tags='["vampire", "throne", "power"]'

# Main script execution

# Create user
signup darklord iLoveDarkness123! "$email2"

# Login user, not strictly necessary to get token, but useful for testing
login darklord iLoveDarkness123!

# Get user information
get_user darklord

echo " >>>>>>>>>>>>>>>>>>> got token: $token"

# Create world
put_world "$world_name" "$world_content" "$world_tags"

get_world "$world_name"

echo " >>>>>>>>>>>>>>>>>>> world successfully created"

# Create collections
put_collection "$collection1_name" "$collection1_content" "$collection1_tags" "$world_name"
put_collection "$collection2_name" "$collection2_content" "$collection2_tags" "$world_name"
put_collection "$collection3_name" "$collection3_content" "$collection3_tags" "$world_name"

get_collection "$collection1_name" "$world_name"
get_collection "$collection2_name" "$world_name"
get_collection "$collection3_name" "$world_name"

echo " >>>>>>>>>>>>>>>>>>> collections successfully created"

# Create entries
put_entry "$entry1_name" "$entry1_content" "$entry1_tags" "$collection1_name" "$world_name"
put_entry "$entry2_name" "$entry2_content" "$entry2_tags" "$collection2_name" "$world_name"
put_entry "$entry3_name" "$entry3_content" "$entry3_tags" "$collection1_name" "$world_name"
put_entry "$entry4_name" "$entry4_content" "$entry4_tags" "$collection2_name" "$world_name"

get_entry "$entry1_name" "$collection1_name" "$world_name"
get_entry "$entry2_name" "$collection2_name" "$world_name"
get_entry "$entry3_name" "$collection1_name" "$world_name"
get_entry "$entry4_name" "$collection2_name" "$world_name"

echo " >>>>>>>>>>>>>>>>>>> entries successfully created"