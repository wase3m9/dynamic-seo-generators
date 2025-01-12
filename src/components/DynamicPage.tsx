import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { LeadForm } from './LeadForm'
import { supabase } from '@/lib/supabase'
import ReactMarkdown from 'react-markdown'
import { Header } from './Header'
import { Footer } from './Footer'
import { ArrowLeft, Loader2 } from 'lucide-react'

export function DynamicPage() {
  const { city = 'london', service = 'accounting' } = useParams()
  const [content, setContent] = useState({
    title: '',
    description: '',
    mainContent: ''
  })
  const [niches, setNiches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const fetchNiches = async () => {
      const { data } = await supabase.from('niches').select('*')
      if (data) setNiches(data)
    }

    fetchNiches()
  }, [])

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true)
      try {
        // Try to fetch from cache first
        const { data: titleData } = await supabase
          .from('content_cache')
          .select('content')
          .eq('city', city)
          .eq('service', service)
          .eq('type', 'meta_title')
          .maybeSingle()

        const { data: descData } = await supabase
          .from('content_cache')
          .select('content')
          .eq('city', city)
          .eq('service', service)
          .eq('type', 'meta_description')
          .maybeSingle()

        const { data: mainData } = await supabase
          .from('content_cache')
          .select('content')
          .eq('city', city)
          .eq('service', service)
          .eq('type', 'main_content')
          .maybeSingle()

        if (!titleData || !descData || !mainData) {
          // Generate new content if any is missing
          setGenerating(true)
          const { data, error } = await supabase.functions.invoke('generate-content', {
            body: { city, service, type: 'all' }
          })

          if (error) throw error

          setContent({
            title: data.title,
            description: data.description,
            mainContent: data.mainContent
          })
          setGenerating(false)
        } else {
          setContent({
            title: titleData.content,
            description: descData.content,
            mainContent: mainData.content
          })
        }
      } catch (error) {
        console.error('Error fetching content:', error)
        setContent({
          title: `${service} Services in ${city} | Cloudkeepers Accountants`,
          description: `Professional ${service} services in ${city} by Cloudkeepers Accountants. Get in touch for expert financial guidance.`,
          mainContent: `# Welcome to Cloudkeepers Accountants ${service} services in ${city}\n\nWe provide professional assistance tailored to your needs.`
        })
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [city, service])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{content.title}</title>
        <meta name="description" content={content.description} />
      </Helmet>

      <Header niches={niches} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            to={`/services/${service}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {service} Services
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {generating ? (
              <div className="flex items-center space-x-2 text-blue-600 mb-4">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating content...</span>
              </div>
            ) : null}
            
            <div className="prose lg:prose-lg">
              <ReactMarkdown>{content.mainContent}</ReactMarkdown>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <LeadForm />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
