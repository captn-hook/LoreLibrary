#!/bin/bash

# Define variables
url="https://i8ta5kemif.execute-api.us-west-2.amazonaws.com/prod"
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
world_name="Grub World"
world_content=$(jq -n --arg text "Grub World" --arg image_url "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Hercules_beetle_%28larva%29.jpg/330px-Hercules_beetle_%28larva%29.jpg" --arg name "Grub World" \
    '[{"text": $text}, {"image_url": $image_url}, {"name": $name}]')
world_tags='["grub", "bio", "biopunk", "biologics", "hive", "ship"]'

# Collections
collection1_name="Biologics"
collection1_content=$(jq -n --arg text "Biologics is the branch of science that deals with the study of living organisms and their interactions with the environment. Throughout our grub history, we have perfected the art of perfecting ourselves." \
    '[{"text": $text}]')
collection1_tags='["biologics", "bio", "biopunk"]'

collection2_name="Bio Hives"
collection2_content=$(jq -n --arg text "Bio Hives are the central hubs of our reproduction and growth. They are the heart of our society, where we cultivate and nurture our grubs." \
    '[{"text": $text}]')
collection2_tags='["hive", "grub"]'

collection3_name="Bio Ships"
collection3_content=$(jq -n --arg text "Bio Ships are our vessels of exploration and expansion. They are living organisms that have been genetically engineered to travel through space." \
    '[{"text": $text}]')
collection3_tags='["ship"]'

collection4_name="Predatory Organisms"
collection4_content=$(jq -n --arg text "Predatory Organisms are the apex predators of our world. They are genetically engineered to protect our hives and ships from external threats." \
    '[{"text": $text}]')
collection4_tags='["predator", "defense", "biopunk"]'

collection5_name="Grub Lore"
collection5_content=$(jq -n --arg text "Grub Lore is the collection of myths, legends, and historical accounts of our species. It serves as a guide to our past and a warning for our future." \
    '[{"text": $text}]')
collection5_tags='["lore", "history", "grub"]'

# Entries
entry1_name="Grub"
entry1_content=$(jq -n --arg text "Grubs are the larval stage of our species. They are small, soft-bodied organisms that feed on organic matter." \
    '[{"text": $text}]')
entry1_tags='["grub"]'

entry2_name="Drone"
entry2_content=$(jq -n --arg text "When most grubs reach maturity, they become drones. Drones are the workers of our society, responsible for gathering food and maintaining the hives." \
    '[{"text": $text}]')
entry2_tags='["grub", "hive"]'

entry3_name="Vessel"
entry3_content=$(jq -n --arg text "Vessels are a grub product, created by preventing the grub from maturing into a drone. Vessels are used to transport food and other resources." \
    '[{"text": $text}]')
entry3_tags='["grub", "ship", "hive"]'

entry4_name="Vampifier"
entry4_content=$(jq -n --arg text "The Vampifier is a predatory class of ship. It was designed to establish new hives in hostile environments. It is equipped with advanced weaponry and defensive systems." \
    '[{"text": $text}]')
entry4_tags='["ship", "hive", "biopunk"]'

entry5_name="Hive Guardian"
entry5_content=$(jq -n --arg text "Hive Guardians are genetically engineered creatures designed to protect the Bio Hives. They are fierce and loyal, defending the hive at all costs." \
    '[{"text": $text}]')
entry5_tags='["hive", "defense", "biopunk"]'

entry6_name="Grub Elder"
entry6_content=$(jq -n --arg text "Grub Elders are the oldest and wisest of our species. They are the keepers of Grub Lore and guide our society with their knowledge." \
    '[{"text": $text}]')
entry6_tags='["lore", "history", "grub"]'

entry7_name="Predator Drone"
entry7_content=$(jq -n --arg text "Predator Drones are specialized drones designed for combat. They are equipped with sharp appendages and venomous stingers to neutralize threats." \
    '[{"text": $text}]')
entry7_tags='["predator", "drone", "defense"]'

entry8_name="The Great Swarm"
entry8_content=$(jq -n --arg text "The Great Swarm is a legendary event in Grub Lore, where countless grubs united to overcome a catastrophic threat to their existence." \
    '[{"text": $text}]')
entry8_tags='["lore", "history", "grub"]'

# Main script execution

# Create user
signup grubman2 iLoveworms123! "$email1"

# Login user, not strictly necessary to get token, but useful for testing
login grubman2 iLoveworms123!

# Get user information
get_user grubman2

echo " >>>>>>>>>>>>>>>>>>> got token: $token"

# Create world
put_world "$world_name" "$world_content" "$world_tags"

get_world "$world_name"

echo " >>>>>>>>>>>>>>>>>>> world successfully created"

# Create collections
put_collection "$collection1_name" "$collection1_content" "$collection1_tags" "$world_name"
put_collection "$collection2_name" "$collection2_content" "$collection2_tags" "$world_name"
put_collection "$collection3_name" "$collection3_content" "$collection3_tags" "$world_name"
put_collection "$collection4_name" "$collection4_content" "$collection4_tags" "$world_name"
put_collection "$collection5_name" "$collection5_content" "$collection5_tags" "$world_name"

get_collection "$collection1_name" "$world_name"
get_collection "$collection2_name" "$world_name"
get_collection "$collection3_name" "$world_name"
get_collection "$collection4_name" "$world_name"
get_collection "$collection5_name" "$world_name"

echo " >>>>>>>>>>>>>>>>>>> collections successfully created"

# Create entries
put_entry "$entry1_name" "$entry1_content" "$entry1_tags" "$collection2_name" "$world_name"
put_entry "$entry2_name" "$entry2_content" "$entry2_tags" "$collection2_name" "$world_name"
put_entry "$entry3_name" "$entry3_content" "$entry3_tags" "$collection1_name" "$world_name"
put_entry "$entry4_name" "$entry4_content" "$entry4_tags" "$collection3_name" "$world_name"
put_entry "$entry5_name" "$entry5_content" "$entry5_tags" "$collection2_name" "$world_name"
put_entry "$entry6_name" "$entry6_content" "$entry6_tags" "$collection5_name" "$world_name"
put_entry "$entry7_name" "$entry7_content" "$entry7_tags" "$collection4_name" "$world_name"
put_entry "$entry8_name" "$entry8_content" "$entry8_tags" "$collection5_name" "$world_name"

get_entry "$entry1_name" "$collection2_name" "$world_name"
get_entry "$entry2_name" "$collection2_name" "$world_name"
get_entry "$entry3_name" "$collection1_name" "$world_name"
get_entry "$entry4_name" "$collection3_name" "$world_name"
get_entry "$entry5_name" "$collection2_name" "$world_name"
get_entry "$entry6_name" "$collection5_name" "$world_name"
get_entry "$entry7_name" "$collection4_name" "$world_name"
get_entry "$entry8_name" "$collection5_name" "$world_name"

echo " >>>>>>>>>>>>>>>>>>> entries successfully created"