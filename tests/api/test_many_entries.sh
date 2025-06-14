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
put_entry_world "$entry1_name tres" "$entry1_content" "$entry1_tags" "$world_name"

# post a collection to a collection
put_subcollection "$collection1_name dos" "$collection1_content" "$collection1_tags" "$collection2_name" "$world_name"

# post entries to the above collection
put_entry "$entry2_name dos" "$entry2_content" "$entry2_tags" "$collection1_name dos" "$world_name"
put_entry "$entry2_name tres" "$entry2_content" "$entry2_tags" "$collection1_name dos" "$world_name"

# put a sub subcollection
put_subcollection "$collection1_name tres" "$collection1_content" "$collection1_tags" "$collection1_name dos" "$world_name"

# post entries to the above collection
put_entry "$entry3_name dos" "$entry3_content" "$entry3_tags" "$collection1_name tres" "$world_name"
put_entry "$entry3_name tres" "$entry3_content" "$entry3_tags" "$collection1_name tres" "$world_name"

# MORE!

collection4_name="Arcane Wonders"
collection4_content=$(jq -n --arg text "Arcane Wonders is a collection of magical artifacts and creatures that embody the essence of the Grub Fantasy Realm's magic." \
    '[{"text": $text}]')
collection4_tags='["arcane", "magic", "fantasy"]'

collection5_name="Mystical Flora"
collection5_content=$(jq -n --arg text "Mystical Flora are the magical plants that thrive in the Grub Fantasy Realm, providing sustenance and magical properties to the ecosystem." \
    '[{"text": $text}]')
collection5_tags='["flora", "magic", "fantasy"]'

collection6_name="Celestial Beasts"
collection6_content=$(jq -n --arg text "Celestial Beasts are the majestic creatures that roam the skies of the Grub Fantasy Realm, often serving as companions to the grubs." \
    '[{"text": $text}]')
collection6_tags='["beasts", "magic", "fantasy"]'

entry5_name="Arcane Artifact"
entry5_content=$(jq -n --arg text "Arcane Artifacts are powerful objects imbued with magical properties, often sought after by adventurers and scholars." \
    '[{"text": $text}]')
entry5_tags='["artifact", "magic"]'

entry6_name="Mystical Plant"
entry6_content=$(jq -n --arg text "Mystical Plants are unique flora that possess magical properties, often used in potions and spells." \
    '[{"text": $text}]')
entry6_tags='["plant", "magic"]'

entry7_name="Celestial Companion"
entry7_content=$(jq -n --arg text "Celestial Companions are the loyal creatures that accompany grubs on their adventures, providing protection and companionship." \
    '[{"text": $text}]')
entry7_tags='["companion", "beast", "magic"]'

entry8_name="Arcane Guardian"
entry8_content=$(jq -n --arg text "Arcane Guardians are powerful protectors of the realm, often taking the form of magical beasts that defend against threats." \
    '[{"text": $text}]')
entry8_tags='["guardian", "magic", "fantasy"]'

entry9_name="Mystical Healer"
entry9_content=$(jq -n --arg text "Mystical Healers are grubs that have developed the ability to heal and restore, using their magical properties to mend wounds and ailments." \
    '[{"text": $text}]')
entry9_tags='["healer", "magic", "fantasy"]'

entry10_name="Celestial Voyager"
entry10_content=$(jq -n --arg text "Celestial Voyagers are grubs that have been transformed into magical vessels, capable of traversing the skies and exploring distant lands." \
    '[{"text": $text}]')
entry10_tags='["voyager", "beast", "magic"]'

put_collection "$collection4_name" "$collection4_content" "$collection4_tags" "$world_name"
put_collection "$collection5_name" "$collection5_content" "$collection5_tags" "$world_name"
put_collection "$collection6_name" "$collection6_content" "$collection6_tags" "$world_name"

put_entry "$entry5_name" "$entry5_content" "$entry5_tags" "$collection4_name" "$world_name"
put_entry "$entry6_name" "$entry6_content" "$entry6_tags" "$collection5_name" "$world_name"
put_entry "$entry7_name" "$entry7_content" "$entry7_tags" "$collection6_name" "$world_name"
put_entry "$entry8_name" "$entry8_content" "$entry8_tags" "$collection4_name" "$world_name"
put_entry "$entry9_name" "$entry9_content" "$entry9_tags" "$collection5_name" "$world_name"
put_entry "$entry10_name" "$entry10_content" "$entry10_tags" "$collection6_name" "$world_name"