#!/bin/bash

# Define variables
url=""
source "$(dirname "$0")/env.sh"
load_env_url
echo "Using URL: $url"

source "$(dirname "$0")/functions.sh"

token=""
username=""
email1="hookt@oregonstate.edu"
emalil2="hooktristanshs@gmail.com"
email3="tristanskyhook@gmail.com"

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

# try updating content
entry1_content=$(jq -n --arg text "Updated text for Grub entry." \
    '[{"text": $text}]')
post_entry "$entry1_name" "$entry1_content" "$collection2_name" "$world_name"

