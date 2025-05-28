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
world_name="Electronopolis"
world_content=$(jq -n --arg text "Electronopolis" --arg image_url "https://www.hallmarknameplate.com/wp-content/uploads/2016/07/circuit-board-1.jpeg" --arg name "Electronopolis" \
    '[{"text": $text}, {"image_url": $image_url}, {"name": $name}]')
world_tags='["electrons", "computer", "city", "circuits", "technology"]'

# Collections
collection1_name="The Circuit Districts"
collection1_content=$(jq -n --arg text "The Circuit Districts are the bustling neighborhoods of Electronopolis. Each district is responsible for a specific function, such as processing, memory, or power distribution." \
    '[{"text": $text}]')
collection1_tags='["circuits", "districts", "city"]'

collection2_name="The Processor Palace"
collection2_content=$(jq -n --arg text "The Processor Palace is the heart of Electronopolis, where the most important decisions are made. Electrons here work tirelessly to execute instructions and keep the city running." \
    '[{"text": $text}]')
collection2_tags='["processor", "palace", "city"]'

collection3_name="The Memory Vaults"
collection3_content=$(jq -n --arg text "The Memory Vaults are vast storage areas where electrons carefully organize and retrieve data. They are the libraries of Electronopolis, preserving its history and knowledge." \
    '[{"text": $text}]')
collection3_tags='["memory", "vaults", "data"]'

collection4_name="The Power Grid"
collection4_content=$(jq -n --arg text "The Power Grid is the lifeline of Electronopolis, delivering energy to every corner of the city. Electrons here are responsible for maintaining the flow of electricity." \
    '[{"text": $text}]')
collection4_tags='["power", "grid", "energy"]'

collection5_name="The Debugging Zone"
collection5_content=$(jq -n --arg text "The Debugging Zone is a mysterious and dangerous area where electrons go to fix errors. It is both feared and respected, as many electrons never return from their missions here." \
    '[{"text": $text}]')
collection5_tags='["debugging", "errors", "danger"]'

# Entries with images
entry1_name="Electron Worker"
entry1_content=$(jq -n --arg text "Electron Workers are the backbone of Electronopolis. They tirelessly move through the circuits, carrying out their tasks to keep the city alive." --arg image_url "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/esupport/esupport-pages/desktop-connected-to-monitor.png" \
    '[{"text": $text}, {"image_url": $image_url}]')
entry1_tags='["electron", "worker", "city"]'

entry2_name="The Clock Tower"
entry2_content=$(jq -n --arg text "The Clock Tower is the central timekeeper of Electronopolis. It ensures that all electrons move in perfect synchronization, maintaining order in the city." --arg image_url "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/ENIAC-changing_a_tube_%28cropped%29.jpg/960px-ENIAC-changing_a_tube_%28cropped%29.jpg" \
    '[{"text": $text}, {"image_url": $image_url}]')
entry2_tags='["clock", "synchronization", "city"]'

entry3_name="The Data Couriers"
entry3_content=$(jq -n --arg text "The Data Couriers are electrons tasked with delivering information across the city. They are the messengers of Electronopolis, ensuring that every instruction reaches its destination." --arg image_url "https://i5.walmartimages.com/seo/Texas-Instruments-TI-30XA-Student-Scientific-Calculator-Type-10-digit-lcd-Black-high-school-and-middle-school-classes_cac85341-0766-4f29-90cb-236ddb2c7e1e.8b700caf75e6f187372826c793425445.jpeg?odnHeight=640&odnWidth=640&odnBg=FFFFFF" \
    '[{"text": $text}, {"image_url": $image_url}]')
entry3_tags='["data", "couriers", "city"]'

entry4_name="The Overclock Festival"
entry4_content=$(jq -n --arg text "The Overclock Festival is a rare event where the entire city speeds up to celebrate its achievements. Electrons move faster than ever, creating a dazzling display of energy." \
    '[{"text": $text}]')
entry4_tags='["festival", "overclock", "celebration"]'

entry5_name="The Blue Screen Catastrophe"
entry5_content=$(jq -n --arg text "The Blue Screen Catastrophe is a legendary event in Electronopolis, where the entire city came to a halt due to an unknown error. It is a cautionary tale told to young electrons." \
    '[{"text": $text}]')
entry5_tags='["error", "catastrophe", "city"]'

entry6_name="The Debugging Heroes"
entry6_content=$(jq -n --arg text "The Debugging Heroes are brave electrons who venture into the Debugging Zone to fix critical errors. They are celebrated as legends, though many never return." \
    '[{"text": $text}]')
entry6_tags='["debugging", "heroes", "city"]'

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
put_collection "$collection5_name" "$collection5_content" "$collection5_tags" "$world_name"

get_collection "$collection1_name" "$world_name"
get_collection "$collection2_name" "$world_name"
get_collection "$collection3_name" "$world_name"
get_collection "$collection4_name" "$world_name"
get_collection "$collection5_name" "$world_name"

echo " >>>>>>>>>>>>>>>>>>> collections successfully created"

# Create entries
put_entry "$entry1_name" "$entry1_content" "$entry1_tags" "$collection1_name" "$world_name"
put_entry "$entry2_name" "$entry2_content" "$entry2_tags" "$collection2_name" "$world_name"
put_entry "$entry3_name" "$entry3_content" "$entry3_tags" "$collection3_name" "$world_name"
put_entry "$entry4_name" "$entry4_content" "$entry4_tags" "$collection4_name" "$world_name"
put_entry "$entry5_name" "$entry5_content" "$entry5_tags" "$collection5_name" "$world_name"
put_entry "$entry6_name" "$entry6_content" "$entry6_tags" "$collection5_name" "$world_name"

get_entry "$entry1_name" "$collection1_name" "$world_name"
get_entry "$entry2_name" "$collection2_name" "$world_name"
get_entry "$entry3_name" "$collection3_name" "$world_name"
get_entry "$entry4_name" "$collection4_name" "$world_name"
get_entry "$entry5_name" "$collection5_name" "$world_name"
get_entry "$entry6_name" "$collection5_name" "$world_name"

echo " >>>>>>>>>>>>>>>>>>> entries successfully created"