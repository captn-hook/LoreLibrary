#!/bin/bash

source "$(dirname "$0")/functions.sh"

token=""
username=""
email1="hookt@oregonstate.edu"
emalil2="hooktristanshs@gmail.com"
email3="tristanskyhook@gmail.com"

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

# Create world
put_world "$world_name" "$world_content" "$world_tags"

get_world "$world_name"

# Create collections
put_collection "$collection1_name" "$collection1_content" "$collection1_tags" "$world_name"
put_collection "$collection2_name" "$collection2_content" "$collection2_tags" "$world_name"
put_collection "$collection3_name" "$collection3_content" "$collection3_tags" "$world_name"
put_collection "$collection4_name" "$collection4_content" "$collection4_tags" "$world_name"

get_collection "$collection1_name" "$world_name"
get_collection "$collection2_name" "$world_name"
get_collection "$collection3_name" "$world_name"
get_collection "$collection4_name" "$world_name"

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

# try to post the same entry again
put_entry "$entry1_name" "$entry1_content" "$entry1_tags" "$collection1_name" "$world_name" "false"
# try to post the same collection again
put_collection "$collection1_name" "$collection1_content" "$collection1_tags" "$world_name" "false"
# try to post the same world again
put_world "$world_name" "$world_content" "$world_tags" "false"