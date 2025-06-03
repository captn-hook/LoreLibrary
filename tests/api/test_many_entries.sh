#!/bin/bash

source "$(dirname "$0")/functions.sh"

token=""
username=""
email1="hookt@oregonstate.edu"
emalil2="hooktristanshs@gmail.com"
email3="tristanskyhook@gmail.com"

# World Information
world_name="Grub Fantasy Realm"
world_content=$(jq -n --arg text "Grub Fantasy Realm" --arg image_url "https://thumbs.dreamstime.com/z/fantasy-landscape-waterfalls-flowers-tropical-plants-foreground-panorama-fantasy-landscape-waterfalls-panorama-305881983.jpg?ct=jpeg" --arg name "Grub Fantasy Realm" \
    '[{"text": $text}, {"image_url": $image_url}, {"name": $name}]')
world_tags='["grub", "fantasy", "magic", "realm", "creatures"]'

# Collections
collection1_name="Magical Biologics"
collection1_content=$(jq -n --arg text "Magical Biologics is the study of living organisms infused with magical properties. In the Grub Fantasy Realm, grubs are often imbued with mystical powers." \
    '[{"text": $text}]')
collection1_tags='["biologics", "magic", "fantasy"]'

collection2_name="Enchanted Hives"
collection2_content=$(jq -n --arg text "Enchanted Hives are mystical structures where grubs are nurtured and grow. These hives are protected by magical wards and are central to the realm's ecosystem." \
    '[{"text": $text}]')
collection2_tags='["hive", "magic", "grub"]'

collection3_name="Mystic Vessels"
collection3_content=$(jq -n --arg text "Mystic Vessels are living, enchanted creatures used for transportation and exploration. They are bred and trained to traverse the magical landscapes of the realm." \
    '[{"text": $text}]')
collection3_tags='["ship", "magic", "fantasy"]'

# Entries
entry1_name="Mystic Grub"
entry1_content=$(jq -n --arg text "Mystic Grubs are the larval stage of magical creatures in the realm. They possess innate magical abilities and are vital to the ecosystem." \
    '[{"text": $text}]')
entry1_tags='["grub", "magic"]'

entry2_name="Hive Guardian"
entry2_content=$(jq -n --arg text "Hive Guardians are mature grubs that have evolved to protect the Enchanted Hives. They are fierce and loyal, using their magical abilities to ward off threats." \
    '[{"text": $text}]')
entry2_tags='["grub", "hive", "magic"]'

entry3_name="Ethereal Vessel"
entry3_content=$(jq -n --arg text "Ethereal Vessels are grubs that have been transformed into magical transport creatures. They are used to carry resources and travelers across the realm." \
    '[{"text": $text}]')
entry3_tags='["grub", "ship", "magic"]'

entry4_name="Arcane Predator"
entry4_content=$(jq -n --arg text "The Arcane Predator is a powerful, predatory creature bred to defend the realm. It is a hybrid of a grub and a magical beast, equipped with both physical and magical defenses." \
    '[{"text": $text}]')
entry4_tags='["ship", "hive", "magic", "fantasy"]'

# Main script execution

# Create user
signup grubman2 iLoveworms123! "$email1"

# Login user, not strictly necessary to get token, but useful for testing
login grubman2 iLoveworms123!

# Get user information
get_user grubman2

# Create world
put_world "$world_name" "$world_content" "$world_tags"

get_world "$world_name"


# Create collections
put_collection "$collection1_name" "$collection1_content" "$collection1_tags" "$world_name"
put_collection "$collection2_name" "$collection2_content" "$collection2_tags" "$world_name"
put_collection "$collection3_name" "$collection3_content" "$collection3_tags" "$world_name"

get_collection "$collection1_name" "$world_name"
get_collection "$collection2_name" "$world_name"
get_collection "$collection3_name" "$world_name"

# Create entries
put_entry "$entry1_name" "$entry1_content" "$entry1_tags" "$collection2_name" "$world_name"
put_entry "$entry2_name" "$entry2_content" "$entry2_tags" "$collection2_name" "$world_name"
put_entry "$entry3_name" "$entry3_content" "$entry3_tags" "$collection1_name" "$world_name"
put_entry "$entry4_name" "$entry4_content" "$entry4_tags" "$collection3_name" "$world_name"

get_entry "$entry1_name" "$collection2_name" "$world_name"
get_entry "$entry2_name" "$collection2_name" "$world_name"
get_entry "$entry3_name" "$collection1_name" "$world_name"
get_entry "$entry4_name" "$collection3_name" "$world_name"

# try to post an entry to the world
put_entry_world "$entry1_name dos" "$entry1_content" "$entry1_tags" "$world_name"
