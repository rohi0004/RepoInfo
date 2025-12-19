export default function JsonLd() {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    name: "RepoInfo",
                    url: "https://repoinfo.in",
                    potentialAction: {
                        "@type": "SearchAction",
                        target: "https://repoinfo.in/?q={search_term_string}",
                        "query-input": "required name=search_term_string"
                    }
                }),
            }}
        />
    );
}
