#!/bin/bash
echo "========================================"
echo " LibraSync - Library Management System"
echo "========================================"
echo ""
echo "Opening application in browser..."
echo ""
echo "Demo Credentials:"
echo "  Admin : admin@library.com / admin123"
echo "  Member: rahul@example.com / member123"
echo ""

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FILE="$DIR/src/main/webapp/index.html"

if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$FILE"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$FILE"
else
    echo "Please manually open: $FILE"
fi

echo "If browser didn't open, manually open:"
echo "$FILE"
