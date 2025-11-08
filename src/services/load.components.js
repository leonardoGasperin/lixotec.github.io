export async function getComponents(component){
    try {
        const response = await fetch(`./src/components/${component}.html`);
        const html = await response.text();
        const headerElement = document.querySelector(`${component}`);
        if (headerElement)
            headerElement.innerHTML = html;
    } catch (error) {
        console.error(`Erro ao carregar o componente ${component}: `, error);
    }
}