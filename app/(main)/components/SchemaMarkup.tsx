// components/SchemaMarkup.tsx
import React from 'react';

interface SchemaData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

interface SchemaMarkupProps {
  schemas: SchemaData[];
}

export function SchemaMarkup({ schemas }: SchemaMarkupProps) {
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 2)
          }}
        />
      ))}
    </>
  );
}