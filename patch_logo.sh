#!/bin/bash
sed -i '' -e '/{\/\* Logo \*\//,/<\/div>/c\
        {/* Logo */}\
        <div className="h-16 flex items-center px-4 border-b border-gray-200">\
          <div className="flex items-center">\
            <img src="/images/logo.png" alt="数智全媒产品平台" className="h-8 object-contain" />\
          </div>\
        </div>\
' src/app/components/Layout.tsx
