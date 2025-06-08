#!/bin/bash

# runs all scripts in this directory that start with test_

failed_tests=() # Array to store names of failed tests

# Check for reset flag
if [[ "$1" == "reset" ]]; then
    if [[ -x "$(dirname "$0")/reset.sh" ]]; then
        echo "Running reset.sh..."
        "$(dirname "$0")/reset.sh"        
    else
        echo "reset.sh is not executable or not found."
        exit 1
    fi
fi

for script in $(dirname "$0")/test_*.sh; do
    # Skip if the script is not executable
    echo -e "\n$script"
    if [[ -x "$script" ]]; then
        "$script"
        if [[ $? -ne 0 ]]; then
            failed_tests+=("$script") # Add failed test to the array
        fi
    else
        echo "Skipping $script (not executable)"
    fi
done

# Report failures at the end
if [[ ${#failed_tests[@]} -gt 0 ]]; then
    echo "The following tests failed:"
    for failed in "${failed_tests[@]}"; do
        echo "  - $failed"
    done
else
    echo "All tests passed successfully."
fi