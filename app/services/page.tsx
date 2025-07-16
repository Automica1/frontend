// app/services/page.tsx
import React from 'react'
import ServicesShowcase from '../components/services/ServiceShowcase'
import SolutionsHero from '../components/services/ServicesHero'

export default function page() {
  return (
    <div>

      <SolutionsHero/>
      <ServicesShowcase />

    </div>
  )
}