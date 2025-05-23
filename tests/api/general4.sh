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
    local response=$(curl -X 'POST' \
        -H 'accept: application/json' \
        -H 'Content-Type: application/json' \
        -d "{\"username\":\"$user\", \"password\":\"$password\", \"email\":\"$email\"}" \
        "$url/signup")

    # Check if signup was 200 OK
    echo "Signup response: $response"
    if [[ $(echo "$response" | jq -r '.status') == "200" ]]; then
        echo "Signup successful"
        login "$user" "$password"
        return
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
world_name="Melancholy Apocalypse"
world_content=$(jq -n --arg text "Melancholy Apocalypse" --arg image_url "https://www.rollingstone.com/wp-content/uploads/2018/06/rs-206389-d53aeed6-4d0a-de6d-1167-43c0611ea6df_TWD_514_GP_1020_0432.jpg?w=1581&h=1054&crop=1" --arg name "Melancholy Apocalypse" \
    '[{"text": $text}, {"image_url": $image_url}, {"name": $name}]')
world_tags='["zombies", "apocalypse", "irony", "humor", "depression"]'

# Collections
collection1_name="Zombie Philosophy"
collection1_content=$(jq -n --arg text "Zombie Philosophy explores the existential dread of being undead. Why do we shuffle? Why do we groan? Is there meaning in brains?" \
    '[{"text": $text}]')
collection1_tags='["philosophy", "zombies", "humor"]'

collection2_name="Undead Society"
collection2_content=$(jq -n --arg text "Undead Society is a grim reflection of the living world. Zombies have formed their own ironic communities, complete with support groups for coping with the afterlife." \
    '[{"text": $text}]')
collection2_tags='["society", "zombies", "irony"]'

collection3_name="The Living Problem"
collection3_content=$(jq -n --arg text "The Living Problem is the ongoing struggle of zombies to coexist with the living. Zombies are tired of being hunted and just want to be left alone to wallow in their misery." \
    '[{"text": $text}]')
collection3_tags='["conflict", "zombies", "humor"]'

collection4_name="Zombie Innovations"
collection4_content=$(jq -n --arg text "Zombie Innovations showcases the ironic inventions of the undead, such as brain-flavored tofu and groan-activated alarm clocks." \
    '[{"text": $text}]')
collection4_tags='["inventions", "zombies", "humor"]'

# Entries
entry1_name="The Existential Groan"
entry1_content=$(jq -n --arg text "The Existential Groan is the sound every zombie makes when they realize they’re stuck in an endless loop of shuffling and groaning. It’s both a cry for help and a resignation to their fate." \
    '[{"text": $text}]')
entry1_tags='["philosophy", "zombies", "humor"]'

entry2_name="Support Group for the Undead"
entry2_content=$(jq -n --arg text "The Support Group for the Undead meets every full moon to discuss their feelings about being zombies. Topics include 'Coping with Rot' and 'Why Do the Living Hate Us?'" \
    '[{"text": $text}]')
entry2_tags='["society", "zombies", "irony"]'

entry3_name="Brain-Free Diet"
entry3_content=$(jq -n --arg text "The Brain-Free Diet is an ironic movement among zombies who are trying to go vegan. They’ve developed brain-flavored tofu as a substitute, but it’s just not the same." \
    '[{"text": $text}]')
entry3_tags='["inventions", "zombies", "humor"]'

entry4_name="The Living Protest"
entry4_content=$(jq -n --arg text "The Living Protest is an annual event where zombies march (or shuffle) to demand equal rights and an end to being hunted. Their slogan: 'We’re Dead, Not Dinner!'" \
    '[{"text": $text}]')
entry4_tags='["conflict", "zombies", "humor"]'

entry5_name="The Great Shuffle-Off"
entry5_content=$(jq -n --arg text "The Great Shuffle-Off is a legendary event in zombie lore where a group of zombies decided to shuffle into the ocean, hoping to find peace. They’re still shuffling underwater to this day." \
    '[{"text": $text}]')
entry5_tags='["philosophy", "zombies", "irony"]'

entry6_name="Groan-Activated Alarm Clock"
entry6_content=$(jq -n --arg text "The Groan-Activated Alarm Clock is a zombie invention that only stops ringing when you groan at it. It’s wildly popular among the undead, who groan anyway." \
    '[{"text": $text}]')
entry6_tags='["inventions", "zombies", "humor"]'

# Main script execution

# Create user
signup zombiemaster iHateBrains123! "$email3"

# Login user, not strictly necessary to get token, but useful for testing
login zombiemaster iHateBrains123!

# Get user information
get_user zombiemaster

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

get_collection "$collection1_name" "$world_name"
get_collection "$collection2_name" "$world_name"
get_collection "$collection3_name" "$world_name"
get_collection "$collection4_name" "$world_name"

echo " >>>>>>>>>>>>>>>>>>> collections successfully created"

# Create entries
put_entry "$entry1_name" "$entry1_content" "$entry1_tags" "$collection1_name" "$world_name"
put_entry "$entry2_name" "$entry2_content" "$entry2_tags" "$collection2_name" "$world_name"
put_entry "$entry3_name" "$entry3_content" "$entry3_tags" "$collection4_name" "$world_name"
put_entry "$entry4_name" "$entry4_content" "$entry4_tags" "$collection3_name" "$world_name"
put_entry "$entry5_name" "$entry5_content" "$entry5_tags" "$collection1_name" "$world_name"
put_entry "$entry6_name" "$entry6_content" "$entry6_tags" "$collection4_name" "$world_name"

get_entry "$entry1_name" "$collection1_name" "$world_name"
get_entry "$entry2_name" "$collection2_name" "$world_name"
get_entry "$entry3_name" "$collection4_name" "$world_name"
get_entry "$entry4_name" "$collection3_name" "$world_name"
get_entry "$entry5_name" "$collection1_name" "$world_name"
get_entry "$entry6_name" "$collection4_name" "$world_name"

echo " >>>>>>>>>>>>>>>>>>> entries successfully created"