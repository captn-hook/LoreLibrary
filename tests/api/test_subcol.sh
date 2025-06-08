#!/bin/bash

source "$(dirname "$0")/functions.sh"

token=""
username=""
email1="hookt@oregonstate.edu"
email2="hooktristanshs@gmail.com"
email3="tristanskyhook@gmail.com"

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
put_entry "$entry1_name" "$entry1_content" "$entry1_tags" "$collection1_name" "$world_name"
put_entry "$entry2_name" "$entry2_content" "$entry2_tags" "$collection2_name" "$world_name"
put_entry "$entry3_name" "$entry3_content" "$entry3_tags" "$collection1_name" "$world_name"
put_entry "$entry4_name" "$entry4_content" "$entry4_tags" "$collection2_name" "$world_name"

get_entry "$entry1_name" "$collection1_name" "$world_name"
get_entry "$entry2_name" "$collection2_name" "$world_name"
get_entry "$entry3_name" "$collection1_name" "$world_name"
get_entry "$entry4_name" "$collection2_name" "$world_name"
