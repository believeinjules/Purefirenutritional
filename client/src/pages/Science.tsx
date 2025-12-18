import { FlaskConical, FileText, ExternalLink, Award, BookOpen, Microscope, Dna, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

interface ResearchPaper {
  title: string;
  authors: string;
  journal: string;
  year: number;
  abstract: string;
  url: string;
  category: string;
}

const researchPapers: ResearchPaper[] = [
  {
    title: "Peptide Bioregulators: A New Class of Geroprotectors",
    authors: "Khavinson V, Linkova N, Dyatlova A, Kuznik B, Umnov R",
    journal: "Current Aging Science",
    year: 2020,
    abstract: "This review summarizes data on the geroprotective properties of short peptides. Peptide bioregulators have been shown to regulate gene expression, restore protein synthesis, and slow down aging processes in various organ systems.",
    url: "https://pubmed.ncbi.nlm.nih.gov/31489893/",
    category: "Anti-Aging"
  },
  {
    title: "Short Peptides Regulate Gene Expression, Protein Synthesis and Enhance Life Span",
    authors: "Khavinson VK, Linkova NS, Tarnovskaya SI",
    journal: "Advances in Gerontology",
    year: 2021,
    abstract: "The study demonstrates that short peptides can penetrate into the cell nucleus and regulate gene expression. This mechanism underlies the geroprotective effects of peptide bioregulators.",
    url: "https://pubmed.ncbi.nlm.nih.gov/32093678/",
    category: "Gene Expression"
  },
  {
    title: "Epithalamin and Thymalin: Effects on Aging and Cancer Prevention",
    authors: "Anisimov VN, Khavinson VK",
    journal: "Experimental Gerontology",
    year: 2003,
    abstract: "Long-term clinical study showing that epithalamin and thymalin treatment in elderly patients resulted in decreased mortality, improved immune function, and reduced cancer incidence over a 6-year follow-up period.",
    url: "https://pubmed.ncbi.nlm.nih.gov/12374906/",
    category: "Clinical Trial"
  },
  {
    title: "NAD+ and Sirtuins in Aging and Disease",
    authors: "Imai S, Guarente L",
    journal: "Trends in Cell Biology",
    year: 2018,
    abstract: "Comprehensive review of NAD+ metabolism and its role in aging. NAD+ decline is a hallmark of aging, and NAD+ supplementation has shown promise in extending healthspan in various model organisms.",
    url: "https://pubmed.ncbi.nlm.nih.gov/29432159/",
    category: "NAD+ Research"
  },
  {
    title: "Spermidine Induces Autophagy and Extends Lifespan",
    authors: "Eisenberg T, Knauer H, Schauer A, et al.",
    journal: "Nature Cell Biology",
    year: 2016,
    abstract: "This landmark study demonstrates that spermidine supplementation triggers autophagy and extends lifespan in yeast, flies, worms, and human cells. The findings support spermidine as a promising longevity intervention.",
    url: "https://pubmed.ncbi.nlm.nih.gov/27411589/",
    category: "Autophagy"
  },
  {
    title: "Coenzyme Q10 and Mitochondrial Function in Aging",
    authors: "Hernández-Camacho JD, Bernier M, López-Lluch G, Navas P",
    journal: "Frontiers in Physiology",
    year: 2018,
    abstract: "Review of CoQ10's essential role in mitochondrial energy production and its decline with age. Supplementation has shown benefits for cardiovascular health, energy levels, and cellular protection.",
    url: "https://pubmed.ncbi.nlm.nih.gov/24389208/",
    category: "Mitochondria"
  },
  {
    title: "Pineal Peptides and Melatonin: Circadian Rhythm Regulation",
    authors: "Khavinson VK, Goncharova ND, Lapin BA",
    journal: "Neuroendocrinology Letters",
    year: 2001,
    abstract: "Study demonstrating that pineal peptides (Epithalamin/Endoluten) can restore melatonin production and normalize circadian rhythms in aging primates, with implications for human aging.",
    url: "https://pubmed.ncbi.nlm.nih.gov/11524632/",
    category: "Circadian Rhythm"
  },
  {
    title: "Thymus Peptides and Immune System Restoration",
    authors: "Khavinson VK, Morozov VG",
    journal: "Mechanisms of Ageing and Development",
    year: 2003,
    abstract: "Clinical evidence showing that thymus peptides (Thymalin/Vladonix) can restore immune function in elderly patients, reducing infection rates and improving overall health outcomes.",
    url: "https://pubmed.ncbi.nlm.nih.gov/12618089/",
    category: "Immune System"
  },
  {
    title: "Resveratrol and Sirtuin Activation for Longevity",
    authors: "Baur JA, Sinclair DA",
    journal: "Nature Reviews Drug Discovery",
    year: 2006,
    abstract: "Comprehensive review of resveratrol's mechanisms of action, including sirtuin activation, and its potential as a calorie restriction mimetic for extending healthspan.",
    url: "https://pubmed.ncbi.nlm.nih.gov/16883309/",
    category: "Sirtuins"
  },
  {
    title: "Cartilage Peptides for Joint Health and Regeneration",
    authors: "Khavinson VK, Ryzhak GA, Grigoriev EI",
    journal: "Bulletin of Experimental Biology and Medicine",
    year: 2017,
    abstract: "Study showing that cartilage-derived peptides (Cartalax) can stimulate chondrocyte proliferation and matrix synthesis, supporting joint health and potentially slowing osteoarthritis progression.",
    url: "https://pubmed.ncbi.nlm.nih.gov/28853107/",
    category: "Joint Health"
  },
  {
    title: "Cardiovascular Peptides: Heart and Vessel Protection",
    authors: "Khavinson VK, Linkova NS, Kvetnoy IM",
    journal: "Advances in Gerontology",
    year: 2019,
    abstract: "Review of cardiovascular peptide bioregulators including Chelohart and Ventfort, demonstrating their ability to support heart muscle function and blood vessel health in aging.",
    url: "https://pubmed.ncbi.nlm.nih.gov/31560178/",
    category: "Cardiovascular"
  },
  {
    title: "Brain Peptides and Cognitive Function in Aging",
    authors: "Khavinson VK, Malinin VV, Grigoriev EI",
    journal: "Peptides",
    year: 2014,
    abstract: "Study demonstrating that brain-derived peptides can improve cognitive function, memory, and neuroprotection in aging models, with potential applications for age-related cognitive decline.",
    url: "https://pubmed.ncbi.nlm.nih.gov/24657283/",
    category: "Cognitive Health"
  },
];

export default function Science() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
                <FlaskConical className="w-10 h-10" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Science & Research</h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              Our products are backed by decades of scientific research. Explore the peer-reviewed studies behind peptide bioregulators and longevity science.
            </p>
          </div>
        </section>

        {/* Key Stats */}
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">40+</div>
                <div className="text-gray-600">Years of Research</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">200+</div>
                <div className="text-gray-600">Clinical Studies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">15M+</div>
                <div className="text-gray-600">Patients Treated</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">100+</div>
                <div className="text-gray-600">Patents Worldwide</div>
              </div>
            </div>
          </div>
        </section>

        {/* About Khavinson */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="bg-orange-100 text-orange-800 mb-4">Pioneer in Peptide Research</Badge>
                <h2 className="text-3xl font-bold mb-4">Professor Vladimir Khavinson</h2>
                <p className="text-gray-600 mb-4">
                  Professor Vladimir Khavinson is a world-renowned gerontologist and the pioneer of peptide bioregulator research. As the President of the European Academy of Gerontology and Geriatrics, he has dedicated over 40 years to studying the effects of short peptides on aging and disease.
                </p>
                <p className="text-gray-600 mb-4">
                  His groundbreaking research has resulted in the development of numerous peptide bioregulators that are now used worldwide to support healthy aging and organ function.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline"><Award className="w-3 h-3 mr-1" /> 200+ Publications</Badge>
                  <Badge variant="outline"><BookOpen className="w-3 h-3 mr-1" /> 15 Monographs</Badge>
                  <Badge variant="outline"><Microscope className="w-3 h-3 mr-1" /> 100+ Patents</Badge>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-80 flex items-center justify-center">
                <span className="text-gray-400">Research Laboratory</span>
              </div>
            </div>
          </div>
        </section>

        {/* IPH Technology Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-orange-50 to-amber-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-orange-600 text-white mb-4">Next-Generation Technology</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Prime Peptide® IPH Technology</h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                Innovative Peptide Health (IPH) technology represents the latest advancement in peptide bioregulation, developed by the St. Petersburg Institute of Bioregulation and Gerontology.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-2 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Microscope className="w-6 h-6 text-orange-600" />
                    IPH REG Complex
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    An innovative natural bioregulator with powerful cellular protection properties:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Oncoprotective properties for cellular defense</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Regenerative capabilities for tissue repair</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Antioxidant protection against oxidative stress</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Supports natural antitumor defenses</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dna className="w-6 h-6 text-orange-600" />
                    IPH EP Complex
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">
                    Advanced peptide complex with pronounced anti-aging effects:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Promotes comprehensive cellular protection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Restores cellular functionality and vitality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Modulates expression of tumor suppressor proteins</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <span>Clinically validated for effectiveness</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white border-2 border-orange-300">
              <CardHeader>
                <CardTitle className="text-2xl text-center">How IPH Technology Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-6 text-center">
                  <div>
                    <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">1</div>
                    <h4 className="font-semibold mb-2 text-sm">Cellular Regulation</h4>
                    <p className="text-xs text-gray-600">IPH peptides act as natural bioregulators at the cellular level</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">2</div>
                    <h4 className="font-semibold mb-2 text-sm">Gene Expression</h4>
                    <p className="text-xs text-gray-600">Modulates expression of key proteins for cellular health</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">3</div>
                    <h4 className="font-semibold mb-2 text-sm">Oxidative Protection</h4>
                    <p className="text-xs text-gray-600">Protects cells from oxidative stress and damage</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">4</div>
                    <h4 className="font-semibold mb-2 text-sm">Tissue Regeneration</h4>
                    <p className="text-xs text-gray-600">Stimulates natural regeneration mechanisms</p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold">5</div>
                    <h4 className="font-semibold mb-2 text-sm">Anti-Aging</h4>
                    <p className="text-xs text-gray-600">Targets key aging mechanisms for comprehensive support</p>
                  </div>
                </div>
                <div className="mt-8 p-6 bg-orange-50 rounded-lg">
                  <p className="text-gray-700 italic text-center">
                    "Modern research in gerontology shows that regulatory processes at the cellular and tissue levels determine the quality and longevity of our lives. Peptides serve as a natural tool for managing these processes. Prime Peptide® products are innovative complexes developed in line with the latest advances in longevity science."
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <a href="/products">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                  Explore Prime Peptide® Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* What Are Peptides - Foundational Science */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="bg-blue-600 text-white mb-4">Foundational Science</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Understanding Peptide Bioregulators</h2>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                Peptides are the body's natural information carriers, regulating cellular function and protein synthesis at the molecular level.
              </p>
            </div>

            {/* What Are Peptides */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Microscope className="w-6 h-6 text-blue-600" />
                  What Are Peptides?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  A peptide is a molecule consisting of two or more amino acids linked together with a peptide bond. With a size of up to 1 nanometer, peptides are part of the nanoworld. Conventionally, a peptide molecule consists of under 100 amino acids, while a protein molecule contains over 100. Peptides can be derived from plants or animals as well as artificially synthesized.
                </p>
                <p className="text-gray-700">
                  In the body, peptides carry information, transferring biological signals from one cell to another to ensure proper functioning. When cells work correctly, the whole body functions optimally. Natural peptides are organic substances that regulate cellular condition, enabling the body to heal itself through cellular-level normalization.
                </p>
              </CardContent>
            </Card>

            {/* How Peptides Work */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dna className="w-5 h-5 text-blue-600" />
                    Cellular Communication
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700">
                  <p className="mb-3">
                    Life exists because of two kinds of molecules: peptides that carry information and DNA that stores genetic information. When peptides enter the body, they immediately begin their work, giving new life to cells by replacing old, damaged cells with new ones.
                  </p>
                  <p>
                    Peptides can increase cell lifetime by 30-40%, launching an active recovery process throughout the body.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    Gene Regulation
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700">
                  <p className="mb-3">
                    Peptide bioregulators have a unique capability to restore protein synthesis in the body that decreases due to illness or aging. This restoration increases adaptation potential and recovery of functional activity.
                  </p>
                  <p>
                    Peptides regulate gene activity, decreasing the activity of "bad" genes while activating "good" genes, thereby stimulating the production of beneficial proteins.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Age-Related Decline */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Age-Related Peptide Decline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-orange-600 mb-2">10x</div>
                    <p className="text-gray-700 text-sm">
                      The amount of peptides in a 55-year-old is <strong>10 times less</strong> than in a 20-year-old
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-orange-600 mb-2">90</div>
                    <p className="text-gray-700 text-sm">
                      Natural aging theoretically starts after age <strong>90</strong> — what we see now is premature aging
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-orange-600 mb-2">40+</div>
                    <p className="text-gray-700 text-sm">
                      Systematic use of peptide bioregulators is advisable starting from age <strong>40</strong>
                    </p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg">
                  <p className="text-gray-700 text-center italic">
                    Protein synthesis smoothly reduces with age, leading to body dysfunction. Elderly people experience longer lasting sicknesses and recovery periods due to dramatically reduced peptide levels.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Role of Proteins */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">The Essential Role of Proteins</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Proteins are the construction material for any living organism. Each protein has its own unique structure and performs strictly defined functions in the body:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-gray-900">Protein hormones</strong>
                      <p className="text-sm text-gray-600">Involved in all life processes including growth and reproduction</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-gray-900">Contractile proteins</strong>
                      <p className="text-sm text-gray-600">Actin and myosin enable all muscle movement</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-gray-900">Protein enzymes</strong>
                      <p className="text-sm text-gray-600">Maintain all chemical processes: respiration, digestion, metabolism</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-gray-900">Hemoglobin</strong>
                      <p className="text-sm text-gray-600">Carries oxygen to cells and removes carbon dioxide</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-gray-900">Immunoglobulins</strong>
                      <p className="text-sm text-gray-600">Antibodies that protect from pathogens, viruses, and bacteria</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-gray-900">Fibrinogen</strong>
                      <p className="text-sm text-gray-600">Responsible for blood clotting in wounds</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits of Peptide Bioregulators */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-2xl">Benefits of Peptide Bioregulators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-3">
                      <Award className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold mb-2">Anti-Aging Effects</h4>
                    <p className="text-sm text-gray-700">
                      Actively prevent aging processes, launch recovery mechanisms, and increase cellular resistance to toxins and harmful factors.
                    </p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-3">
                      <FlaskConical className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold mb-2">Immediate Action</h4>
                    <p className="text-sm text-gray-700">
                      Unlike supplements that may take time to show effects, peptides begin working immediately upon entering the body.
                    </p>
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-3">
                      <Microscope className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold mb-2">Tissue-Specific Action</h4>
                    <p className="text-sm text-gray-700">
                      Different peptide bioregulators target specific organs and tissues, providing targeted support where needed.
                    </p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-white rounded-lg">
                  <p className="text-gray-700 text-center">
                    <strong>Scientific Foundation:</strong> The Institute of Gerontology and Bio-Regulation led by Prof. V.Kh. Khavinson developed a comprehensive program after 20 years of research focusing on prevention of age-related problems, decreased mortality, and increased working period.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Research Library */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Research Library</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore peer-reviewed research on peptide bioregulators, NAD+ science, autophagy, and longevity interventions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {researchPapers.map((paper, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge className="mb-2 bg-blue-100 text-blue-800">{paper.category}</Badge>
                        <CardTitle className="text-lg leading-tight">{paper.title}</CardTitle>
                      </div>
                      <FileText className="w-8 h-8 text-gray-300 flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-2">
                      {paper.authors} • {paper.journal} ({paper.year})
                    </p>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {paper.abstract}
                    </p>
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View on PubMed
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How Peptides Work */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How Peptide Bioregulators Work</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Understanding the science behind peptide bioregulation
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-orange-600">1</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Cellular Uptake</h3>
                  <p className="text-gray-600 text-sm">
                    Short peptides (2-4 amino acids) are absorbed and transported into cells, where they can reach the nucleus.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-orange-600">2</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Gene Regulation</h3>
                  <p className="text-gray-600 text-sm">
                    Peptides interact with DNA and histones to regulate gene expression, activating genes responsible for protein synthesis.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-orange-600">3</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Tissue Restoration</h3>
                  <p className="text-gray-600 text-sm">
                    Increased protein synthesis leads to improved tissue function, cellular regeneration, and organ health.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
